import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Lead, User } from "@/models";
import { FOLLOW_UP_AFTER_DAYS, FOLLOW_UP_STATUSES, MAX_FOLLOW_UPS } from "@/constants/leads";

/**
 * GET /api/external/pipeline — read-only pipeline feed for Munib's Command Center.
 *
 * Auth: `Authorization: Bearer <DEALFLOW_API_TOKEN>` (not Clerk — the caller is a server).
 * Scope: the active workspace of the user with email DEALFLOW_API_USER_EMAIL. Demo data excluded.
 * Public in proxy.ts; this handler is the only gate.
 */

const DAY_MS = 86_400_000;

function tokenMatches(header: string | null): boolean {
  const expected = process.env.DEALFLOW_API_TOKEN;
  if (!expected || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}

export async function GET(req: Request) {
  if (!process.env.DEALFLOW_API_TOKEN || !process.env.DEALFLOW_API_USER_EMAIL) {
    return NextResponse.json({ error: "External API is not configured" }, { status: 503 });
  }
  if (!tokenMatches(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ email: process.env.DEALFLOW_API_USER_EMAIL.toLowerCase().trim() })
      .select("activeWorkspaceId")
      .lean();
    if (!user?.activeWorkspaceId) {
      return NextResponse.json({ error: "No workspace for DEALFLOW_API_USER_EMAIL" }, { status: 404 });
    }

    const leads = await Lead.find({ workspaceId: user.activeWorkspaceId, isDemoData: { $ne: true } })
      .select("clientName clientCompany serviceOffered platform status followUpCount lastFollowUpAt leadSentAt repliedAt convertedAt updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        rules: { maxFollowUps: MAX_FOLLOW_UPS, followUpAfterDays: FOLLOW_UP_AFTER_DAYS },
        leads: leads.map((l) => {
          const waiting = FOLLOW_UP_STATUSES.includes(l.status) && (l.followUpCount ?? 0) < MAX_FOLLOW_UPS;
          const lastTouch = l.lastFollowUpAt ?? l.leadSentAt ?? l.createdAt;
          return {
            id: String(l._id),
            name: l.clientCompany || l.clientName,
            contact: l.clientName,
            service: l.serviceOffered,
            platform: l.platform,
            status: l.status,
            followUpCount: l.followUpCount ?? 0,
            lastTouchAt: lastTouch ? new Date(lastTouch).toISOString() : null,
            // null when no follow-up is expected (replied, closed, or limit reached)
            nextFollowUpAt: waiting && lastTouch ? new Date(new Date(lastTouch).getTime() + FOLLOW_UP_AFTER_DAYS * DAY_MS).toISOString() : null,
            convertedAt: l.convertedAt ? new Date(l.convertedAt).toISOString() : null,
            updatedAt: new Date(l.updatedAt).toISOString(),
          };
        }),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[GET /api/external/pipeline]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
