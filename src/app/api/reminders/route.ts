import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User, Reminder } from "@/models";

const FREQ_TO_DAYS: Record<string, number> = {
  once: 0, daily: 1, every2days: 2, every3days: 3, weekly: 7, monthly: 30,
};

const CreateReminderSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().optional(),
  type: z.enum(["lead", "client", "custom"]).default("custom"),
  linkedId: z.string().optional(),
  linkedName: z.string().optional(),
  channels: z.array(z.enum(["email", "whatsapp", "in-app"])).default(["in-app"]),
  frequency: z.enum(["once", "daily", "every2days", "every3days", "weekly", "monthly"]).default("once"),
  nextReminderAt: z.string(),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user?.activeWorkspaceId) return NextResponse.json({ reminders: [] });

    const reminders = await Reminder.find({ workspaceId: user.activeWorkspaceId })
      .sort({ nextReminderAt: 1 })
      .lean();

    return NextResponse.json({ reminders });
  } catch (err) {
    console.error("[GET /api/reminders]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateReminderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user?.activeWorkspaceId) return NextResponse.json({ error: "no_workspace" }, { status: 403 });

    const { frequency, linkedId, type, title, description, linkedName, nextReminderAt } = parsed.data;
    const intervalDays = FREQ_TO_DAYS[frequency] ?? 0;

    const reminder = await Reminder.create({
      title,
      notes: description,
      linkedName,
      workspaceId: user.activeWorkspaceId,
      createdBy: user._id,
      assignedTo: user._id,
      linkedType: type !== "custom" ? type : "general",
      linkedId: linkedId || undefined,
      nextReminderAt: new Date(nextReminderAt),
      recurring: intervalDays > 0,
      recurringInterval: intervalDays > 0 ? intervalDays : undefined,
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reminders]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
