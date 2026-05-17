import { create } from "zustand";
import type { Client, CreateClientDto } from "@/types/client";

let _nextId = 100;

const INITIAL_CLIENTS: Client[] = [
  {
    _id: "1",
    name: "Sarah Johnson",
    email: "sarah@techcorp.io",
    phone: "+1 555 0101",
    company: "TechCorp",
    platform: "UPWORK",
    status: "active",
    totalRevenue: 12500,
    currency: "USD",
    projectsCount: 4,
    workspaceId: "ws1",
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    _id: "2",
    name: "Ahmed Malik",
    email: "ahmed@digitalstudio.pk",
    company: "Digital Studio",
    platform: "DIRECT",
    status: "active",
    totalRevenue: 450000,
    currency: "PKR",
    projectsCount: 7,
    workspaceId: "ws1",
    createdAt: "2025-10-20T00:00:00Z",
    updatedAt: "2026-02-10T00:00:00Z",
  },
  {
    _id: "3",
    name: "Emily Chen",
    email: "emily@brandco.com",
    phone: "+44 7700 900000",
    company: "BrandCo",
    platform: "LINKEDIN",
    status: "inactive",
    totalRevenue: 3200,
    currency: "GBP",
    projectsCount: 2,
    notes: "On hold — budget freeze until Q3",
    workspaceId: "ws1",
    createdAt: "2025-09-05T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    _id: "4",
    name: "Carlos Rivera",
    email: "carlos@rivera.ae",
    company: "Rivera Group",
    platform: "REFERRAL",
    status: "active",
    totalRevenue: 28000,
    currency: "AED",
    projectsCount: 3,
    workspaceId: "ws1",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },
  {
    _id: "5",
    name: "Zara Hussain",
    email: "zara@fiverr.user",
    platform: "FIVERR",
    status: "churned",
    totalRevenue: 850,
    currency: "USD",
    projectsCount: 1,
    workspaceId: "ws1",
    createdAt: "2025-08-01T00:00:00Z",
    updatedAt: "2025-11-30T00:00:00Z",
  },
];

interface ClientStore {
  clients: Client[];
  addClient: (data: CreateClientDto) => void;
  updateClient: (id: string, data: Partial<CreateClientDto>) => void;
  deleteClient: (id: string) => void;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: INITIAL_CLIENTS,
  addClient: (data) =>
    set((s) => ({
      clients: [
        {
          _id: String(_nextId++),
          ...data,
          phone: data.phone || undefined,
          company: data.company || undefined,
          notes: data.notes || undefined,
          totalRevenue: data.totalRevenue ?? 0,
          projectsCount: 0,
          workspaceId: "ws1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...s.clients,
      ],
    })),
  updateClient: (id, data) =>
    set((s) => ({
      clients: s.clients.map((c) =>
        c._id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    })),
  deleteClient: (id) =>
    set((s) => ({ clients: s.clients.filter((c) => c._id !== id) })),
}));
