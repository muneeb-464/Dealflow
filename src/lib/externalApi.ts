import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type mongoose from "mongoose";
import { User } from "@/models";
import { FOLLOW_UP_AFTER_DAYS, FOLLOW_UP_STATUSES, MAX_FOLLOW_UPS } from "@/constants/leads";

/**
 * Shared pieces of the external (server-to-server) API used by Command Center and n8n:
 * the bearer-token gate, the workspace it is scoped to, and the lead shape it returns.
 * Every external route uses these — there is only one auth path.
 */

const DAY_MS = 86_400_000;

/** The lead fields the external feed needs. Keep in step with toFeedLead(). */
export const LEAD_FEED_FIELDS =
  "clientName clientCompany email serviceOffered platform campaign status followUpCount lastFollowUpAt leadSentAt repliedAt convertedAt updatedAt createdAt";

function tokenMatches(header: string | null): boolean {
  const expected = process.env.DEALFLOW_API_TOKEN;
  if (!expected || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}

/** Returns an error response when the caller may not use the external API, or null when allowed. */
export function checkExternalAuth(req: Request): NextResponse | null {
  if (!process.env.DEALFLOW_API_TOKEN || !process.env.DEALFLOW_API_USER_EMAIL) {
    return NextResponse.json({ error: "External API is not configured" }, { status: 503 });
  }
  if (!tokenMatches(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** The one workspace the external API may read and write: active workspace of DEALFLOW_API_USER_EMAIL. */
export async function getExternalWorkspaceId(): Promise<mongoose.Types.ObjectId | null> {
  const email = process.env.DEALFLOW_API_USER_EMAIL?.toLowerCase().trim();
  if (!email) return null;
  const user = await User.findOne({ email }).select("activeWorkspaceId").lean();
  return user?.activeWorkspaceId ?? null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** One lead in the shape every external caller gets. Lean docs and hydrated docs both work. */
export function toFeedLead(l: any) {
  const waiting = FOLLOW_UP_STATUSES.includes(l.status) && (l.followUpCount ?? 0) < MAX_FOLLOW_UPS;
  const lastTouch = l.lastFollowUpAt ?? l.leadSentAt ?? l.createdAt;
  return {
    id: String(l._id),
    name: l.clientCompany || l.clientName,
    contact: l.clientName,
    // The lead's own address — this is what the automation sends to
    email: l.email ?? "",
    service: l.serviceOffered,
    platform: l.platform,
    campaign: l.campaign ?? "",
    status: l.status,
    followUpCount: l.followUpCount ?? 0,
    lastTouchAt: lastTouch ? new Date(lastTouch).toISOString() : null,
    // null when no follow-up is expected (replied, closed, or limit reached)
    nextFollowUpAt: waiting && lastTouch ? new Date(new Date(lastTouch).getTime() + FOLLOW_UP_AFTER_DAYS * DAY_MS).toISOString() : null,
    convertedAt: l.convertedAt ? new Date(l.convertedAt).toISOString() : null,
    updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : new Date().toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
