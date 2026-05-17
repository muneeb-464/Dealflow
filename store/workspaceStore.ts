import { create } from "zustand";
import type { WorkspaceMember, InviteMemberDto } from "@/types/user";

let _nextId = 10;

const INITIAL_MEMBERS: WorkspaceMember[] = [
  { id: "m1", name: "Muneeb Ahmed", email: "464muneeb@gmail.com", role: "owner", status: "active", joinedAt: "2025-10-01T00:00:00Z" },
  { id: "m2", name: "Ali Hassan", email: "ali@dealflow.pk", role: "manager", status: "active", joinedAt: "2025-11-15T00:00:00Z" },
  { id: "m3", name: "Sara Khan", email: "sara@dealflow.pk", role: "employee", status: "active", joinedAt: "2026-01-10T00:00:00Z" },
  { id: "m4", name: "Bilal Ahmed", email: "bilal@dealflow.pk", role: "employee", status: "pending", joinedAt: "2026-04-20T00:00:00Z" },
];

interface WorkspaceStore {
  members: WorkspaceMember[];
  inviteMember: (data: InviteMemberDto) => void;
  removeMember: (id: string) => void;
  updateRole: (id: string, role: WorkspaceMember["role"]) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  members: INITIAL_MEMBERS,

  inviteMember: (data) =>
    set((s) => ({
      members: [
        ...s.members,
        {
          id: `m${_nextId++}`,
          name: data.name,
          email: data.email,
          role: data.role,
          status: "pending",
          joinedAt: new Date().toISOString(),
        },
      ],
    })),

  removeMember: (id) =>
    set((s) => ({ members: s.members.filter((m) => m.id !== id) })),

  updateRole: (id, role) =>
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, role } : m)),
    })),
}));
