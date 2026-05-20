import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User, Lead, Client, WorkspaceMember } from "@/models";

// Slab → [leadCount, clientCount]
const SLABS: Record<string, [number, number]> = {
  "1–5 clients":    [50,  5],
  "6–20 clients":   [100, 20],
  "21–50 clients":  [150, 50],
  "51–100 clients": [200, 100],
  "100+ clients":   [300, 100],
};

const COMPANIES = ["Nexora","Brightwave","Lumient","Codera","Stratix","Veltron","Pixflow","Arkstone","Zenith Labs","Clearpath","Innovatech","BlueSky Digital","Alpha Creative","Peak Solutions","Skyline Media","Orbit Agency","Vertex Studio","Ironclad","Momentum Co","Solara","Prism Works","Cascade Digital","Nova Bridge","Elevate Agency","Arclight","Stackwise","Pulsate","Clarity Co","Deeproot","Ironpeak","Crestline","Luminary","Vantage Point","Folio Works","Artisan Labs","Radiant Media","Quantum Leap","Silveredge","Firstbase","Clearview","Streamline Co","BoldMark","Trident Media","Skyward","Highpoint","Ironworks","Elevate","Bridgepoint","Corelink","Cloudpath"];

const FIRST_NAMES = ["James","Maria","Lucas","Sara","Ahmed","Emily","David","Sofia","Omar","Jessica","Michael","Ayesha","Chris","Fatima","Daniel","Layla","Adam","Zara","Ryan","Nina","Jake","Mia","Ethan","Lena","Noah","Hana","Alex","Chloe","Jason","Amara"];
const LAST_NAMES = ["Walker","Chen","Hassan","Kim","Patel","Johnson","Ali","Martinez","Brown","Garcia","Williams","Taylor","Anderson","Lee","Thompson","White","Moore","Davis","Wilson","Clark","Lewis","Hall","Young","Allen","Wright","Scott","Adams","Baker","Nelson","Hill"];

const SERVICES = ["Web Development","Mobile App Development","UI/UX Design","Logo & Branding","SEO Optimization","Social Media Management","Content Writing","Video Editing","WordPress Development","E-commerce Development","React Development","Next.js Development","Shopify Store","Landing Page Design","Email Marketing","Copywriting","App Design","Digital Marketing","Motion Graphics","Technical SEO"];

const PLATFORMS: Array<"upwork"|"fiverr"|"linkedin"|"direct"|"referral"|"whatsapp"|"other"> = ["upwork","fiverr","linkedin","direct","referral","whatsapp","other"];
const STATUSES: Array<"sent"|"pending"|"followup_due"|"replied"|"converted"|"rejected"> = ["sent","pending","followup_due","replied","converted","rejected"];
const CLIENT_STATUSES: Array<"active"|"inactive"|"churned"> = ["active","active","active","inactive","churned"];

const LEAD_NOTES = [
  "Client interested in a complete redesign. Budget confirmed.",
  "Reached out via platform message. Awaiting response.",
  "Had a 30-min call. They need delivery by end of month.",
  "Referral from existing client. High priority.",
  "Sent proposal. Client reviewing options.",
  "Client comparing multiple freelancers. Follow up Friday.",
  "Budget is tight but project scope is clear.",
  "Repeat client from last quarter.",
  "Needs NDA signed before sharing project details.",
  "Very responsive. Should close soon.",
  "Client wants weekly progress updates.",
  "Agency project — multiple stakeholders involved.",
  "Startup with seed funding. Urgency is high.",
  "Long-term retainer possible if project goes well.",
  "Detailed brief provided. No revisions expected.",
];

const CLIENT_NOTES = [
  "Excellent communicator. Always pays on time.",
  "Prefers async communication over calls.",
  "Has referred 2 other clients already.",
  "Requires detailed invoices with line items.",
  "Long-term partnership potential.",
  "Seasonal client — active Q1 and Q3.",
  "Very detail-oriented. Provide thorough updates.",
  "Agency partner — sends regular projects.",
  "Startup client growing fast.",
  "Prefers Slack for day-to-day communication.",
];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function rndAmount(): number {
  const tier = Math.random();
  if (tier < 0.35) return rndInt(100, 800);
  if (tier < 0.65) return rndInt(800, 2000);
  if (tier < 0.85) return rndInt(2000, 3500);
  return rndInt(3500, 5000);
}

function rndDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function rndEmail(first: string, last: string, company: string): string {
  const domains = ["gmail.com","yahoo.com","outlook.com","hotmail.com"];
  const co = company.toLowerCase().replace(/[^a-z]/g,"").slice(0,8);
  const opts = [`${first.toLowerCase()}.${last.toLowerCase()}@${rnd(domains)}`, `${first.toLowerCase()}@${co}.com`, `${last.toLowerCase()}${rndInt(10,99)}@${rnd(domains)}`];
  return rnd(opts);
}

function rndPhone(): string {
  return `+1${rndInt(200,999)}${rndInt(100,999)}${rndInt(1000,9999)}`;
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!user.activeWorkspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

    // Check owner role
    const member = await WorkspaceMember.findOne({ workspaceId: user.activeWorkspaceId, userId: user._id });
    if (member?.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });

    if (user.hasDemoData) return NextResponse.json({ error: "Demo data already exists" }, { status: 400 });

    const estimatedClients = (clerkUser.unsafeMetadata?.estimatedClients as string) ?? "1–5 clients";
    const [leadCount, clientCount] = SLABS[estimatedClients] ?? [50, 5];

    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-05-21");

    // Generate leads
    const leads = Array.from({ length: leadCount }, () => {
      const first = rnd(FIRST_NAMES);
      const last = rnd(LAST_NAMES);
      const company = rnd(COMPANIES);
      const status = rnd(STATUSES);
      const sentAt = rndDate(startDate, endDate);
      return {
        workspaceId: user.activeWorkspaceId,
        assignedTo: user._id,
        createdBy: user._id,
        clientName: `${first} ${last}`,
        clientEmail: rndEmail(first, last, company),
        clientCompany: company,
        platform: rnd(PLATFORMS),
        serviceOffered: rnd(SERVICES),
        proposedAmount: rndAmount(),
        currency: "USD",
        notes: rnd(LEAD_NOTES),
        status,
        leadSentAt: sentAt,
        repliedAt: ["replied","converted"].includes(status) ? new Date(sentAt.getTime() + rndInt(1,5) * 86400000) : undefined,
        convertedAt: status === "converted" ? new Date(sentAt.getTime() + rndInt(3,10) * 86400000) : undefined,
        followUpCount: status === "followup_due" ? rndInt(1,3) : 0,
        isDemoData: true,
      };
    });

    // Generate clients
    const clients = Array.from({ length: clientCount }, () => {
      const first = rnd(FIRST_NAMES);
      const last = rnd(LAST_NAMES);
      const company = rnd(COMPANIES);
      const revenue = rndAmount() * rndInt(1, 4);
      return {
        workspaceId: user.activeWorkspaceId,
        assignedTo: user._id,
        createdBy: user._id,
        name: `${first} ${last}`,
        email: rndEmail(first, last, company),
        phone: rndPhone(),
        company,
        platform: rnd(PLATFORMS),
        status: rnd(CLIENT_STATUSES),
        totalRevenue: revenue,
        currency: "USD",
        notes: rnd(CLIENT_NOTES),
        tags: [],
        orders: [{
          title: rnd(SERVICES),
          amount: revenue,
          currency: "USD",
          status: "completed" as const,
          startDate: rndDate(startDate, endDate),
        }],
        isDemoData: true,
      };
    });

    await Lead.insertMany(leads);
    await Client.insertMany(clients);

    user.hasDemoData = true;
    await user.save();

    return NextResponse.json({ success: true, leads: leadCount, clients: clientCount });
  } catch (err) {
    console.error("[POST /api/demo]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user?.activeWorkspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

    const member = await WorkspaceMember.findOne({ workspaceId: user.activeWorkspaceId, userId: user._id });
    if (member?.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });

    await Lead.deleteMany({ workspaceId: user.activeWorkspaceId, isDemoData: true });
    await Client.deleteMany({ workspaceId: user.activeWorkspaceId, isDemoData: true });

    user.hasDemoData = false;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/demo]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
