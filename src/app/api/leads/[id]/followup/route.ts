import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getRouteAuthContext } from "@/lib/routeAuth";
import { closeLeadReminders } from "@/lib/leads";
import { MAX_FOLLOW_UPS, FOLLOW_UP_STATUSES } from "@/constants/leads";
import { Lead } from "@/models";

// POST /api/leads/:id/followup — log one sent follow-up.
// Max MAX_FOLLOW_UPS per lead. The last one moves the lead to "dead" (no reply).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await connectDB();
    const ctx = await getRouteAuthContext(userId);
    if (!ctx) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const existing = await Lead.findOne({ _id: id, workspaceId: ctx.workspaceId }).select("createdBy").lean();
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (ctx.role === "employee" && !existing.createdBy.equals(ctx.userId)) {
      return NextResponse.json({ error: "You can only update leads you created" }, { status: 403 });
    }

    // Atomic: two quick clicks can never push the count past the limit.
    const now = new Date();
    let lead = await Lead.findOneAndUpdate(
      {
        _id: id,
        workspaceId: ctx.workspaceId,
        status: { $in: FOLLOW_UP_STATUSES },
        followUpCount: { $lt: MAX_FOLLOW_UPS },
      },
      { $inc: { followUpCount: 1 }, $set: { lastFollowUpAt: now, status: "pending" } },
      { returnDocument: "after" }
    );

    if (!lead) {
      return NextResponse.json(
        { error: `No more follow-ups: limit is ${MAX_FOLLOW_UPS}, or the lead is already closed` },
        { status: 409 }
      );
    }

    if (lead.followUpCount >= MAX_FOLLOW_UPS) {
      lead = await Lead.findOneAndUpdate(
        { _id: lead._id, workspaceId: ctx.workspaceId },
        { $set: { status: "dead", lostReason: "no_reply" }, $unset: { nextFollowUpAt: 1 } },
        { returnDocument: "after" }
      );
      if (lead) await closeLeadReminders(ctx.workspaceId, lead._id);
    }

    return NextResponse.json({ lead });
  } catch (err) {
    console.error("[POST /api/leads/:id/followup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
