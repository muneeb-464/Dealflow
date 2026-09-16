import { create } from "zustand";
import type { Lead, LeadInput } from "@/components/leads/LeadTable";
import type { LeadStatus } from "@/components/leads/LeadStatusBadge";

// DB status → UI status
const DB_TO_UI: Record<string, LeadStatus> = {
  sent: "Sent",
  pending: "Pending",
  followup_due: "Follow-up",
  replied: "Replied",
  converted: "Converted",
  rejected: "Rejected",
  dead: "Dead",
};

// UI status → DB status
const UI_TO_DB: Record<LeadStatus, string> = {
  Sent: "sent",
  Pending: "pending",
  "Follow-up": "followup_due",
  Replied: "replied",
  Converted: "converted",
  Rejected: "rejected",
  Dead: "dead",
};

// Pages reuse cached leads if they were fetched this recently (mutations update the cache directly).
const FRESH_MS = 30_000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUILead(doc: any): Lead {
  return {
    id: String(doc._id),
    clientName: doc.clientName,
    platform: doc.platform,
    campaign: doc.campaign ?? "",
    status: DB_TO_UI[doc.status] ?? "Sent",
    service: doc.serviceOffered,
    notes: doc.notes ?? "",
    sentAt: doc.leadSentAt ? new Date(doc.leadSentAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    followUpCount: doc.followUpCount ?? 0,
    lastFollowUpAt: doc.lastFollowUpAt ? new Date(doc.lastFollowUpAt).toISOString() : undefined,
    assignedTo: doc.assignedTo ? String(doc.assignedTo) : undefined,
    createdBy: doc.createdBy ? String(doc.createdBy?._id ?? doc.createdBy) : undefined,
    createdByName: doc.createdBy?.name ?? undefined,
  };
}

interface LeadStore {
  leads: Lead[];
  loading: boolean;
  lastFetched: number;
  fetchLeads: (force?: boolean) => Promise<void>;
  addLead: (data: LeadInput) => Promise<void>;
  updateLead: (id: string, data: LeadInput) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  setStatus: (id: string, status: LeadStatus) => Promise<void>;
  logFollowUp: (id: string) => Promise<string | null>;
}

let inflight: Promise<void> | null = null;

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  loading: false,
  lastFetched: 0,

  fetchLeads: async (force = false) => {
    if (inflight) return inflight;
    if (!force && Date.now() - get().lastFetched < FRESH_MS) return;
    inflight = (async () => {
      set({ loading: true });
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (res.ok) set({ leads: (data.leads ?? []).map(toUILead), lastFetched: Date.now() });
      } finally {
        set({ loading: false });
        inflight = null;
      }
    })();
    return inflight;
  },

  addLead: async (data) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: data.clientName,
        platform: data.platform.toLowerCase(),
        campaign: (data.campaign ?? "").trim(),
        serviceOffered: data.service,
        notes: data.notes,
        status: UI_TO_DB[data.status] ?? "sent",
        leadSentAt: data.sentAt,
      }),
    });
    const json = await res.json();
    if (res.status === 403 && json.error === "no_workspace") {
      window.location.href = "/workspace-setup";
      return;
    }
    if (res.ok && json.lead) {
      set((s) => ({ leads: [toUILead(json.lead), ...s.leads] }));
    }
  },

  updateLead: async (id, data) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: data.clientName,
        platform: data.platform.toLowerCase(),
        campaign: (data.campaign ?? "").trim(),
        serviceOffered: data.service,
        notes: data.notes,
        status: UI_TO_DB[data.status] ?? "sent",
      }),
    });
    const json = await res.json();
    if (res.ok && json.lead) {
      // PATCH returns the raw doc without the populated creator — keep the name we already have
      set((s) => ({
        leads: s.leads.map((l) => (l.id === id ? { ...toUILead(json.lead), createdByName: l.createdByName } : l)),
      }));
    }
  },

  deleteLead: async (id) => {
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
    }
  },

  setStatus: async (id, status) => {
    const existing = get().leads.find((l) => l.id === id);
    if (!existing) return;
    await get().updateLead(id, { ...existing, status });
  },

  logFollowUp: async (id) => {
    const res = await fetch(`/api/leads/${id}/followup`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.lead) return json.error ?? "Could not log follow-up";
    set((s) => ({
      leads: s.leads.map((l) => (l.id === id ? { ...toUILead(json.lead), createdByName: l.createdByName } : l)),
    }));
    return null;
  },
}));
