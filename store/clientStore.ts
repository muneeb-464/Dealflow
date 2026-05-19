import { create } from "zustand";
import type { Client, CreateClientDto } from "@/types/client";

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
  fetchClients: () => Promise<void>;
  addClient: (data: CreateClientDto) => Promise<void>;
  updateClient: (id: string, data: Partial<CreateClientDto>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  loading: false,

  fetchClients: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (res.ok) set({ clients: (data.clients ?? []).map(toUIClient) });
    } finally {
      set({ loading: false });
    }
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
      set((s) => ({ clients: s.clients.map((c) => (c._id === id ? toUIClient(json.client) : c)) }));
    }
  },

  deleteClient: async (id) => {
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      set((s) => ({ clients: s.clients.filter((c) => c._id !== id) }));
    }
  },
}));
