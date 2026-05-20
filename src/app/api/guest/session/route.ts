import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { WorkspaceInvite, Workspace, User } from "@/models";

// POST /api/guest/session — validates invite token, sets guest cookie, no auth required
export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    await connectDB();

    const invite = await WorkspaceInvite.findOne({ token, status: "pending" });
    if (!invite) return NextResponse.json({ error: "Invite not found or already used" }, { status: 404 });

    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    const [workspace, inviter] = await Promise.all([
      Workspace.findById(invite.workspaceId).select("name").lean(),
      User.findById(invite.invitedBy).select("name").lean(),
    ]);

    const workspaceName = (workspace as { name: string } | null)?.name ?? "Workspace";
    const inviterName = (inviter as { name: string } | null)?.name ?? "A team member";

    const guestData = {
      token,
      workspaceId: String(invite.workspaceId),
      workspaceName,
      inviterName,
      role: "invite_guest",
      email: invite.email,
      name: "Guest",
      expiresAt: invite.expiresAt.toISOString(),
    };

    const cookieValue = Buffer.from(JSON.stringify(guestData)).toString("base64");
    const maxAge = Math.floor((invite.expiresAt.getTime() - Date.now()) / 1000);

    const res = NextResponse.json({ ok: true, workspaceName });
    res.cookies.set("dealflow-guest", cookieValue, {
      httpOnly: false, // needs to be readable by client JS for authStore hydration
      path: "/",
      maxAge: Math.max(maxAge, 0),
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("[POST /api/guest/session]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
