import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/withAuth";
import type { AuthContext } from "@/lib/withAuth";
import { Lead } from "@/models";

// GET /api/leads/campaigns — campaign names already used in this workspace, most recently used first.
// Feeds the suggestion list in the add/edit lead form so one campaign is not typed three ways.
export const GET = withAuth(async (_req: Request, ctx: AuthContext) => {
  await connectDB();

  const rows = await Lead.aggregate([
    { $match: { workspaceId: ctx.workspaceId, campaign: { $nin: [null, ""] } } },
    { $group: { _id: "$campaign", lastUsedAt: { $max: "$updatedAt" } } },
    { $sort: { lastUsedAt: -1 } },
    { $limit: 50 },
  ]);

  return NextResponse.json({ campaigns: rows.map((r) => String(r._id)) });
});
