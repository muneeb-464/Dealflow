import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User, Reminder } from "@/models";

const UpdateReminderSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().optional(),
  type: z.enum(["lead", "client", "custom"]).optional(),
  linkedId: z.string().optional(),
  linkedName: z.string().optional(),
  channels: z.array(z.enum(["email", "whatsapp", "in-app"])).optional(),
  frequency: z.enum(["once", "daily", "every2days", "every3days", "weekly", "monthly"]).optional(),
  nextReminderAt: z.string().optional(),
  status: z.enum(["active", "done", "snoozed"]).optional(),
});

const FREQ_TO_DAYS: Record<string, number> = {
  once: 0, daily: 1, every2days: 2, every3days: 3, weekly: 7, monthly: 30,
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateReminderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user?.activeWorkspaceId) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.nextReminderAt) update.nextReminderAt = new Date(parsed.data.nextReminderAt);
    if (parsed.data.frequency) {
      const days = FREQ_TO_DAYS[parsed.data.frequency] ?? 0;
      update.recurring = days > 0;
      update.recurringInterval = days > 0 ? days : undefined;
    }
    if (parsed.data.status === "done") update.emailSent = false;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, workspaceId: user.activeWorkspaceId },
      { $set: update },
      { new: true }
    );
    if (!reminder) return NextResponse.json({ error: "Reminder not found" }, { status: 404 });

    return NextResponse.json({ reminder });
  } catch (err) {
    console.error("[PATCH /api/reminders/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user?.activeWorkspaceId) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    await Reminder.findOneAndDelete({ _id: id, workspaceId: user.activeWorkspaceId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/reminders/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
