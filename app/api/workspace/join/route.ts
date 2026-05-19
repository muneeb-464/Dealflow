import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User, WorkspaceInvite, WorkspaceMember } from "@/models";

const JoinSchema = z.object({
  token: z.string().uuid(),
});

// POST /api/workspace/join — accept an invite token after user registers/logs in
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = JoinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await connectDB();

    const invite = await WorkspaceInvite.findOne({ token: parsed.data.token });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.status !== "pending") {
      return NextResponse.json({ error: `Invite is ${invite.status}` }, { status: 410 });
    }
    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found. Call /api/auth/sync first." }, { status: 404 });

    // Ensure invited email matches logged-in user
    if (user.email !== invite.email) {
      return NextResponse.json({ error: "This invite was sent to a different email address" }, { status: 403 });
    }

    // Check not already a member
    const alreadyMember = await WorkspaceMember.findOne({
      workspaceId: invite.workspaceId,
      userId: user._id,
    });
    if (alreadyMember) {
      return NextResponse.json({ error: "Already a member of this workspace" }, { status: 409 });
    }

    // Add member
    await WorkspaceMember.create({
      workspaceId: invite.workspaceId,
      userId: user._id,
      role: invite.role,
    });

    // Set as active workspace
    user.activeWorkspaceId = invite.workspaceId;
    await user.save();

    // Mark invite accepted
    invite.status = "accepted";
    await invite.save();

    return NextResponse.json({
      message: "Joined workspace",
      workspaceId: invite.workspaceId,
      role: invite.role,
    });
  } catch (err) {
    console.error("[POST /api/workspace/join]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
