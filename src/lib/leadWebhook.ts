import type mongoose from "mongoose";
import { getExternalWorkspaceId, toFeedLead } from "./externalApi";

/**
 * Tells n8n about a brand new lead so the outreach automation can pick it up without waiting
 * for its next poll of /api/external/pipeline.
 *
 * Fire and forget: any failure is logged and swallowed. Creating a lead must never fail or wait
 * on this. Does nothing unless N8N_LEAD_WEBHOOK_URL is set, and only for the one workspace the
 * external API is scoped to.
 */

const TIMEOUT_MS = 5_000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function notifyLeadCreated(lead: any, workspaceId: mongoose.Types.ObjectId) {
  const url = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!url) return;

  try {
    const externalWorkspaceId = await getExternalWorkspaceId();
    if (!externalWorkspaceId || !externalWorkspaceId.equals(workspaceId)) return;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ event: "lead.created", lead: toFeedLead(lead) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error("[lead webhook] n8n answered", res.status);
  } catch (err) {
    // No retries on purpose — the automation also polls the feed as a safety net
    console.error("[lead webhook]", err);
  }
}
