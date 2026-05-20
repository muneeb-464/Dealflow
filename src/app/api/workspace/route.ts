import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User, Workspace, WorkspaceMember, WorkspaceInvite, Lead, Client, Reminder, Revenue, ApprovalRequest } from "@/models";

const CreateWorkspaceSchema = z.object({
  name: z.string().min(2).max(60).trim(),
  currency: z.enum(["USD", "PKR", "EUR", "GBP", "AED", "CAD", "AUD"]).default("USD"),
  timezone: z.string().default("Asia/Karachi"),
});

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// POST /api/workspace — create new workspace
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found. Call /api/auth/sync first." }, { status: 404 });

    const { name, currency, timezone } = parsed.data;

    // Ensure unique slug
    let slug = toSlug(name);
    const existing = await Workspace.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const workspace = await Workspace.create({
      name,
      slug,
      currency,
      timezone,
      ownerId: user._id,
    });

    // Add owner as member
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: user._id,
      role: "owner",
    });

    // Set as active workspace
    user.activeWorkspaceId = workspace._id;
    await user.save();

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/workspace]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(2).max(60).trim().optional(),
  currency: z.enum(["USD", "PKR", "EUR", "GBP", "AED", "CAD", "AUD"]).optional(),
  timezone: z.string().optional(),
});

// PATCH /api/workspace — update active workspace settings
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = UpdateWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user?.activeWorkspaceId) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const workspace = await Workspace.findByIdAndUpdate(
      user.activeWorkspaceId,
      { $set: parsed.data },
      { new: true }
    );

    return NextResponse.json({ workspace });
  } catch (err) {
    console.error("[PATCH /api/workspace]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/workspace — permanently delete active workspace (owner only)
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user?.activeWorkspaceId) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const workspaceId = user.activeWorkspaceId;

    // Only owner can delete
    const membership = await WorkspaceMember.findOne({ workspaceId, userId: user._id, role: "owner" });
    if (!membership) return NextResponse.json({ error: "Only the workspace owner can delete it" }, { status: 403 });

    // Clear activeWorkspaceId for all members
    const memberIds = (await WorkspaceMember.find({ workspaceId }).select("userId").lean()).map((m) => m.userId);
    await User.updateMany({ _id: { $in: memberIds } }, { $unset: { activeWorkspaceId: 1 } });

    // Delete all workspace data
    await Promise.all([
      WorkspaceMember.deleteMany({ workspaceId }),
      WorkspaceInvite.deleteMany({ workspaceId }),
      Lead.deleteMany({ workspaceId }),
      Client.deleteMany({ workspaceId }),
      Reminder.deleteMany({ workspaceId }),
      Revenue.deleteMany({ workspaceId }),
      ApprovalRequest.deleteMany({ workspaceId }),
      Workspace.findByIdAndDelete(workspaceId),
    ]);

    return NextResponse.json({ message: "Workspace deleted" });
  } catch (err) {
    console.error("[DELETE /api/workspace]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/workspace — get current user's active workspace
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!user.activeWorkspaceId) return NextResponse.json({ workspace: null });

    const workspace = await Workspace.findById(user.activeWorkspaceId);
    return NextResponse.json({ workspace });
  } catch (err) {
    console.error("[GET /api/workspace]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
