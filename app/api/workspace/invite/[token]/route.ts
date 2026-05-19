import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { WorkspaceInvite, Workspace, User } from "@/models";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    await connectDB();

    const invite = await WorkspaceInvite.findOne({ token });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.status !== "pending") {
      return NextResponse.json({ error: `Invite is ${invite.status}` }, { status: 410 });
    }
    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    const [workspace, inviter] = await Promise.all([
      Workspace.findById(invite.workspaceId).select("name").lean(),
      User.findById(invite.invitedBy).select("name").lean(),
    ]);

    return NextResponse.json({
      workspaceName: (workspace as { name: string } | null)?.name ?? "Unknown workspace",
      inviterName: (inviter as { name: string } | null)?.name ?? "A team member",
      role: invite.role,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    console.error("[GET /api/workspace/invite/:token]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
