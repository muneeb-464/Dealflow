import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { checkExternalAuth, getExternalWorkspaceId, LEAD_FEED_FIELDS, toFeedLead } from "@/lib/externalApi";
import { Lead } from "@/models";
import { FOLLOW_UP_AFTER_DAYS, MAX_FOLLOW_UPS } from "@/constants/leads";

/**
 * GET /api/external/pipeline — read-only pipeline feed for Munib's Command Center.
 *
 * Auth: `Authorization: Bearer <DEALFLOW_API_TOKEN>` (not Clerk — the caller is a server).
 * Scope: the active workspace of the user with email DEALFLOW_API_USER_EMAIL.
 * Demo data is excluded unless `?demo=1` (for checking the layout before real leads exist).
 * Public in proxy.ts; the token check is the only gate.
 */
export async function GET(req: Request) {
  const denied = checkExternalAuth(req);
  if (denied) return denied;

  try {
    await connectDB();

    const workspaceId = await getExternalWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace for DEALFLOW_API_USER_EMAIL" }, { status: 404 });
    }

    const includeDemo = new URL(req.url).searchParams.get("demo") === "1";

    const leads = await Lead.find({
      workspaceId,
      ...(includeDemo ? {} : { isDemoData: { $ne: true } }),
    })
      .select(LEAD_FEED_FIELDS)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        includesDemo: includeDemo,
        rules: { maxFollowUps: MAX_FOLLOW_UPS, followUpAfterDays: FOLLOW_UP_AFTER_DAYS },
        leads: leads.map(toFeedLead),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[GET /api/external/pipeline]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
