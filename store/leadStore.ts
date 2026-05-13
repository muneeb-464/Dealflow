import { create } from "zustand";
import type { Lead } from "@/components/leads/LeadTable";
import type { LeadStatus } from "@/components/leads/LeadStatusBadge";

let _nextId = 1;

interface LeadStore {
  leads: Lead[];
  loading: boolean;
  addLead: (data: Omit<Lead, "id">) => void;
  updateLead: (id: string, data: Omit<Lead, "id">) => void;
  deleteLead: (id: string) => void;
  setStatus: (id: string, status: LeadStatus) => void;
  simulateLoad: () => void;
}

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  loading: true,
  addLead: (data) =>
    set((s) => ({ leads: [{ ...data, id: String(_nextId++) }, ...s.leads] })),
  updateLead: (id, data) =>
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...data, id } : l)) })),
  deleteLead: (id) =>
    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
  setStatus: (id, status) =>
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, status } : l)) })),
  simulateLoad: () => {
    set({ loading: true });
    setTimeout(() => set({ loading: false }), 1200);
  },
}));
