import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { WorkspaceMember, Lead, Client } from "@/models";
import mongoose from "mongoose";

// GET /api/workspace/analytics/team — per-member performance stats
// owner/manager: full team; employee: own stats only
export const GET = withAuth(async (_req, ctx) => {
  const workspaceOid = new mongoose.Types.ObjectId(ctx.workspaceId);
  const isManagerOrAbove = ctx.role === "owner" || ctx.role === "manager";

  const [members, leadStats, clientStats] = await Promise.all([
    isManagerOrAbove
      ? WorkspaceMember.find({ workspaceId: ctx.workspaceId }).populate("userId", "name email avatar").lean()
      : WorkspaceMember.find({ workspaceId: ctx.workspaceId, userId: ctx.user._id }).populate("userId", "name email avatar").lean(),

    Lead.aggregate([
      { $match: { workspaceId: workspaceOid, ...(isManagerOrAbove ? {} : { assignedTo: ctx.user._id }) } },
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          followupDue: { $sum: { $cond: [{ $eq: ["$status", "followup_due"] }, 1, 0] } },
        },
      },
    ]),

    Client.aggregate([
      { $match: { workspaceId: workspaceOid, ...(isManagerOrAbove ? {} : { assignedTo: ctx.user._id }) } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
    ]),
  ]);

  const leadMap: Record<string, { total: number; converted: number; rejected: number; followupDue: number }> = {};
  for (const l of leadStats) {
    if (l._id) leadMap[String(l._id)] = { total: l.total, converted: l.converted, rejected: l.rejected, followupDue: l.followupDue };
  }

  const clientMap: Record<string, number> = {};
  for (const c of clientStats) {
    if (c._id) clientMap[String(c._id)] = c.count;
  }

  const result = members.map((m) => {
    const u = m.userId as unknown as { _id: string; name: string; email: string; avatar?: string };
    const uid = String(u._id);
    const ls = leadMap[uid] ?? { total: 0, converted: 0, rejected: 0, followupDue: 0 };
    const closedLeads = ls.converted + ls.rejected;
    const openLeads = ls.total - closedLeads;
    const winRate = closedLeads > 0 ? Math.round((ls.converted / closedLeads) * 100) : 0;

    return {
      id: String(m._id),
      userId: uid,
      name: u.name,
      email: u.email,
      avatar: u.avatar ?? null,
      role: m.role,
      joinedAt: m.joinedAt,
      stats: {
        assignedLeads: ls.total,
        openLeads,
        convertedLeads: ls.converted,
        rejectedLeads: ls.rejected,
        followupDue: ls.followupDue,
        assignedClients: clientMap[uid] ?? 0,
        winRate,
      },
    };
  });

  // Sort by total assigned leads descending
  result.sort((a, b) => b.stats.assignedLeads - a.stats.assignedLeads);

  return NextResponse.json({ members: result });
});
