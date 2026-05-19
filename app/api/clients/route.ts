import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/withAuth";
import type { AuthContext } from "@/lib/withAuth";
import { Client, Reminder } from "@/models";

const CreateClientSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  platform: z.string().default("direct"),
  status: z.enum(["active", "inactive", "churned"]).default("active"),
  currency: z.string().default("USD"),
  totalRevenue: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const GET = withAuth(async (_req: Request, ctx: AuthContext) => {
  await connectDB();
  const clients = await Client.find({ workspaceId: ctx.workspaceId })
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ clients });
});

export const POST = withAuth(async (req: Request, ctx: AuthContext) => {
  await connectDB();
  const body = await req.json();
  const parsed = CreateClientSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const client = await Client.create({
    ...parsed.data,
    email: parsed.data.email || undefined,
    workspaceId: ctx.workspaceId,
    assignedTo: ctx.user._id,
    createdBy: ctx.user._id,
    tags: [],
    orders: [],
  });

  const now = new Date();
  const day2 = new Date(now); day2.setDate(day2.getDate() + 2);
  const day3 = new Date(now); day3.setDate(day3.getDate() + 3);

  await Reminder.insertMany([
    {
      title: `Project check-in: ${client.name}`,
      notes: `Check in with ${client.name} — any updates needed on their project?`,
      workspaceId: ctx.workspaceId,
      createdBy: ctx.user._id,
      assignedTo: ctx.user._id,
      linkedType: "client",
      linkedId: client._id,
      linkedName: client.name,
      nextReminderAt: day2,
      recurring: false,
      status: "active",
      emailSent: false,
    },
    {
      title: `Follow up with ${client.name}`,
      notes: `Send a project progress update to ${client.name}. Keep them in the loop.`,
      workspaceId: ctx.workspaceId,
      createdBy: ctx.user._id,
      assignedTo: ctx.user._id,
      linkedType: "client",
      linkedId: client._id,
      linkedName: client.name,
      nextReminderAt: day3,
      recurring: false,
      status: "active",
      emailSent: false,
    },
  ]);

  return NextResponse.json({ client }, { status: 201 });
});
