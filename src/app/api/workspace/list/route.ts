import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { WorkspaceMember, Workspace } from "@/models";

// GET /api/workspace/list — all workspaces the current user belongs to
export const GET = withAuth(async (_req, ctx) => {
  const memberships = await WorkspaceMember.find({ userId: ctx.user._id }).lean();
  const workspaceIds = memberships.map((m) => m.workspaceId);

  const workspaces = await Workspace.find({ _id: { $in: workspaceIds } })
    .select("_id name slug currency timezone ownerId createdAt")
    .lean();

  const membershipMap = new Map(memberships.map((m) => [String(m.workspaceId), m.role]));

  const result = workspaces.map((w) => ({
    _id: String(w._id),
    name: w.name,
    slug: w.slug,
    currency: w.currency,
    timezone: w.timezone,
    role: membershipMap.get(String(w._id)) ?? "employee",
    isActive: String(w._id) === String(ctx.workspaceId),
  }));

  result.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));

  return NextResponse.json({ workspaces: result });
});
