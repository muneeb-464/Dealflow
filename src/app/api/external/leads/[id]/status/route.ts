import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { checkExternalAuth, getExternalWorkspaceId, toFeedLead } from "@/lib/externalApi";
import { closeLeadReminders } from "@/lib/leads";
import { MAX_FOLLOW_UPS } from "@/constants/leads";
import { Lead } from "@/models";
import type { LeadStatus } from "@/models/Lead";

/**
 * POST /api/external/leads/:id/status — the outreach automation reports what it did.
 *
 * Same auth and workspace scope as GET /api/external/pipeline.
 * Only these three existing statuses may be set: "sent" (first email sent), "replied", "dead".
 * Nothing else about the lead can be changed here.
 */

const StatusSchema = z.object({
  status: z.enum(["sent", "replied", "dead"]),
  step: z.number().int().min(0).max(MAX_FOLLOW_UPS).optional(),
  at: z.string().optional(),
  note: z.string().max(200).optional(),
});

// Stages a human moves a lead into. The automation must never pull a lead back out of them.
const AFTER_REPLIED: LeadStatus[] = ["converted", "rejected"];
const MANUAL_STAGES: LeadStatus[] = ["replied", ...AFTER_REPLIED];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkExternalAuth(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectDB();

    const workspaceId = await getExternalWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace for DEALFLOW_API_USER_EMAIL" }, { status: 404 });
    }

    const lead = await Lead.findOne({ _id: id, workspaceId });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const { status, step, at, note } = parsed.data;

    // Never undo manual work: "sent"/"dead" lose to any human stage from "replied" onwards,
    // and even "replied" loses once the lead was moved past it.
    const blocked = status === "replied" ? AFTER_REPLIED : MANUAL_STAGES;
    if (blocked.includes(lead.status)) {
      return NextResponse.json({ skipped: true, reason: "manual stage", lead: toFeedLead(lead) });
    }

    const touchedAt = at && !isNaN(Date.parse(at)) ? new Date(at) : new Date();

    lead.status = status;
    lead.lastFollowUpAt = touchedAt;
    if (step !== undefined) lead.followUpCount = step;
    if (status === "replied" && !lead.repliedAt) lead.repliedAt = touchedAt;
    if (status === "dead" && !lead.lostReason) lead.lostReason = "no_reply";

    const line = `[${touchedAt.toISOString().slice(0, 10)}] automation: ${status}${step !== undefined ? ` (step ${step})` : ""}${note ? ` — ${note}` : ""}`;
    lead.notes = lead.notes ? `${lead.notes}\n${line}` : line;

    await lead.save();

    // A dead lead should stop nagging, same as when it dies from 3 follow-ups in the app
    if (status === "dead") await closeLeadReminders(workspaceId, lead._id);

    return NextResponse.json({ lead: toFeedLead(lead) });
  } catch (err) {
    console.error("[POST /api/external/leads/:id/status]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
