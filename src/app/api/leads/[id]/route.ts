import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User, Lead, WorkspaceMember } from "@/models";

const UpdateLeadSchema = z.object({
  clientName: z.string().min(1).max(100).trim().optional(),
  clientEmail: z.string().optional(),
  clientCompany: z.string().optional(),
  platform: z.enum(["upwork", "fiverr", "linkedin", "direct", "referral", "whatsapp", "other"]).optional(),
  serviceOffered: z.string().min(1).max(200).trim().optional(),
  proposedAmount: z.number().min(0).optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["sent", "pending", "followup_due", "replied", "converted", "rejected"]).optional(),
});

async function getAuthContext(userId: string) {
  const user = await User.findOne({ clerkId: userId });
  if (!user?.activeWorkspaceId) return null;
  const member = await WorkspaceMember.findOne({
    workspaceId: user.activeWorkspaceId,
    userId: user._id,
  }).lean() as { role: string } | null;
  if (!member) return null; // removed from workspace
  return { user, role: member.role };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateLeadSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const ctx = await getAuthContext(userId);
    if (!ctx) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const lead = await Lead.findOne({ _id: id, workspaceId: ctx.user.activeWorkspaceId });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (ctx.role === "employee" && !lead.createdBy.equals(ctx.user._id)) {
      return NextResponse.json({ error: "You can only edit leads you created" }, { status: 403 });
    }

    Object.assign(lead, parsed.data);
    await lead.save();

    return NextResponse.json({ lead });
  } catch (err) {
    console.error("[PATCH /api/leads/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await connectDB();
    const ctx = await getAuthContext(userId);
    if (!ctx) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const lead = await Lead.findOne({ _id: id, workspaceId: ctx.user.activeWorkspaceId });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (ctx.role === "employee" && !lead.createdBy.equals(ctx.user._id)) {
      return NextResponse.json({ error: "You can only delete leads you created" }, { status: 403 });
    }

    await lead.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/leads/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
