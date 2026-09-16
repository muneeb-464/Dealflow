import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/withAuth";
import type { AuthContext } from "@/lib/withAuth";
import { Lead, Reminder } from "@/models";
import { LEAD_PLATFORMS, LEAD_STATUSES } from "@/constants/leads";
import { notifyLeadCreated } from "@/lib/leadWebhook";

const CreateLeadSchema = z.object({
  clientName: z.string().min(1).max(100).trim(),
  clientEmail: z.string().optional(),
  clientCompany: z.string().optional(),
  email: z.union([z.literal(""), z.string().email().max(200)]).optional(),
  platform: z.enum(LEAD_PLATFORMS),
  campaign: z.string().max(60).trim().optional(),
  serviceOffered: z.string().min(1).max(200).trim(),
  proposedAmount: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
  status: z.enum(LEAD_STATUSES).default("sent"),
  leadSentAt: z.string().optional(),
});

export const GET = withAuth(async (_req: Request, ctx: AuthContext) => {
  await connectDB();
  const leads = await Lead.find({ workspaceId: ctx.workspaceId })
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ leads });
});

export const POST = withAuth(async (req: Request, ctx: AuthContext) => {
  await connectDB();
  const body = await req.json();
  const parsed = CreateLeadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const lead = await Lead.create({
    ...parsed.data,
    clientEmail: parsed.data.clientEmail || undefined,
    workspaceId: ctx.workspaceId,
    assignedTo: ctx.user._id,
    createdBy: ctx.user._id,
    leadSentAt: parsed.data.leadSentAt ? new Date(parsed.data.leadSentAt) : new Date(),
  });

  const now = new Date();
  const day2 = new Date(now); day2.setDate(day2.getDate() + 2);
  const day3 = new Date(now); day3.setDate(day3.getDate() + 3);

  await Reminder.insertMany([
    {
      title: `Follow up on lead: ${lead.clientName}`,
      notes: `No reply yet? Send a follow-up to ${lead.clientName} about "${lead.serviceOffered}".`,
      workspaceId: ctx.workspaceId,
      createdBy: ctx.user._id,
      assignedTo: ctx.user._id,
      linkedType: "lead",
      linkedId: lead._id,
      linkedName: lead.clientName,
      nextReminderAt: day2,
      recurring: false,
      status: "active",
      emailSent: false,
    },
    {
      title: `Second follow up: ${lead.clientName}`,
      notes: `Still no response? Try a final nudge to ${lead.clientName} for "${lead.serviceOffered}".`,
      workspaceId: ctx.workspaceId,
      createdBy: ctx.user._id,
      assignedTo: ctx.user._id,
      linkedType: "lead",
      linkedId: lead._id,
      linkedName: lead.clientName,
      nextReminderAt: day3,
      recurring: false,
      status: "active",
      emailSent: false,
    },
  ]);

  // On create only. Never blocks or fails the request — see lib/leadWebhook.ts
  await notifyLeadCreated(lead, ctx.workspaceId);

  return NextResponse.json({ lead }, { status: 201 });
});
