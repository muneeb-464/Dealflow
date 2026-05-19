import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { WorkspaceMember, WorkspaceInvite, User, Lead, Client } from "@/models";
import mongoose from "mongoose";

// GET /api/workspace/members — list all members + pending + removed invites + per-member counts
export const GET = withAuth(async (_req, ctx) => {
  const workspaceOid = new mongoose.Types.ObjectId(ctx.workspaceId);

  const [members, invites, leadCounts, clientCounts] = await Promise.all([
    WorkspaceMember.find({ workspaceId: ctx.workspaceId })
      .populate("userId", "name email avatar")
      .lean(),
    WorkspaceInvite.find({
      workspaceId: ctx.workspaceId,
      status: { $in: ["pending", "removed"] },
    })
      .select("email role expiresAt createdAt status token")
      .lean(),
    Lead.aggregate([
      { $match: { workspaceId: workspaceOid } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
    ]),
    Client.aggregate([
      { $match: { workspaceId: workspaceOid } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
    ]),
  ]);

  const leadMap: Record<string, number> = {};
  for (const l of leadCounts) leadMap[String(l._id)] = l.count;

  const clientMap: Record<string, number> = {};
  for (const c of clientCounts) clientMap[String(c._id)] = c.count;

  const formatted = members.map((m) => {
    const u = m.userId as unknown as { _id: string; name: string; email: string; avatar?: string };
    const uid = String(u._id);
    return {
      id: m._id,
      userId: uid,
      name: u.name,
      email: u.email,
      avatar: u.avatar ?? null,
      role: m.role,
      joinedAt: m.joinedAt,
      leadCount: leadMap[uid] ?? 0,
      clientCount: clientMap[uid] ?? 0,
    };
  });

  const pendingInvites = invites.filter((i) => i.status === "pending");
  const removedInvites = invites.filter((i) => i.status === "removed");

  return NextResponse.json({ members: formatted, pendingInvites, removedInvites });
});

// DELETE /api/workspace/members — remove a member (owner only)
export const DELETE = withAuth(async (req, ctx) => {
  const { memberId } = await req.json();
  if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  const member = await WorkspaceMember.findOne({
    _id: memberId,
    workspaceId: ctx.workspaceId,
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  if (member.role === "owner") {
    return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 400 });
  }

  // Mark invite removed + clear workspace from removed user so their next sync redirects them
  const userDoc = await User.findById(member.userId).select("email activeWorkspaceId");
  if (userDoc?.email) {
    await WorkspaceInvite.findOneAndUpdate(
      { workspaceId: ctx.workspaceId, email: userDoc.email, status: "accepted" },
      { status: "removed" }
    );
  }
  if (userDoc && String(userDoc.activeWorkspaceId) === ctx.workspaceId.toString()) {
    userDoc.activeWorkspaceId = undefined;
    await userDoc.save();
  }

  await member.deleteOne();
  return NextResponse.json({ message: "Member removed" });
}, "owner");
