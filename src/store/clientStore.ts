import { create } from "zustand";
import type { Client, CreateClientDto } from "@/types/client";

// Pages reuse cached clients if they were fetched this recently (mutations update the cache directly).
const FRESH_MS = 30_000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUIClient(doc: any): Client {
  return {
    _id: String(doc._id),
    name: doc.name,
    email: doc.email ?? "",
    phone: doc.phone,
    company: doc.company,
    platform: (doc.platform ?? "direct").toUpperCase() as Client["platform"],
    status: doc.status ?? "active",
    billingType: doc.billingType ?? "one_time",
    totalRevenue: doc.totalRevenue ?? 0,
    currency: doc.currency ?? "USD",
    projectsCount: doc.orders?.length ?? 0,
    notes: doc.notes,
    assignedTo: doc.assignedTo ? String(doc.assignedTo) : undefined,
    createdBy: doc.createdBy ? String(doc.createdBy?._id ?? doc.createdBy) : undefined,
    createdByName: doc.createdBy?.name ?? undefined,
    workspaceId: String(doc.workspaceId),
    createdAt: doc.createdAt ?? new Date().toISOString(),
    updatedAt: doc.updatedAt ?? new Date().toISOString(),
  };
}

interface ClientStore {
  clients: Client[];
  loading: boolean;
  lastFetched: number;
  fetchClients: (force?: boolean) => Promise<void>;
  addClient: (data: CreateClientDto) => Promise<void>;
  updateClient: (id: string, data: Partial<CreateClientDto>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

let inflight: Promise<void> | null = null;

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  loading: false,
  lastFetched: 0,

  fetchClients: async (force = false) => {
    if (inflight) return inflight;
    if (!force && Date.now() - get().lastFetched < FRESH_MS) return;
    inflight = (async () => {
      set({ loading: true });
      try {
        const res = await fetch("/api/clients");
        const data = await res.json();
        if (res.ok) set({ clients: (data.clients ?? []).map(toUIClient), lastFetched: Date.now() });
      } finally {
        set({ loading: false });
        inflight = null;
      }
    })();
    return inflight;
  },

  addClient: async (data) => {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        platform: data.platform.toLowerCase(),
      }),
    });
    const json = await res.json();
    if (res.status === 403 && json.error === "no_workspace") {
      window.location.href = "/workspace-setup";
      return;
    }
    if (res.ok && json.client) {
      set((s) => ({ clients: [toUIClient(json.client), ...s.clients] }));
    }
  },

  updateClient: async (id, data) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        platform: data.platform ? data.platform.toLowerCase() : undefined,
      }),
    });
    const json = await res.json();
    if (res.ok && json.client) {
      // PATCH returns the raw doc without the populated creator — keep the name we already have
      set((s) => ({
        clients: s.clients.map((c) => (c._id === id ? { ...toUIClient(json.client), createdByName: c.createdByName } : c)),
      }));
    }
  },

  deleteClient: async (id) => {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      set((s) => ({ clients: s.clients.filter((c) => c._id !== id) }));
    }
  },
}));
