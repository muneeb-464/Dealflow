import { create } from "zustand";
import type { WorkspaceMember } from "@/types/user";

interface WorkspaceStore {
  members: WorkspaceMember[];
  loading: boolean;
  fetchMembers: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  members: [],
  loading: false,

  fetchMembers: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/workspace/members");
      const data = await res.json();
      if (res.ok && data.members) {
        set({
          members: data.members.map((m: {
            id: string; userId: string; name: string; email: string;
            role: WorkspaceMember["role"]; joinedAt: string;
            leadCount?: number; clientCount?: number;
          }) => ({
            id: m.id,
            userId: m.userId,
            name: m.name,
            email: m.email,
            role: m.role,
            status: "active" as const,
            joinedAt: m.joinedAt,
            leadCount: m.leadCount ?? 0,
            clientCount: m.clientCount ?? 0,
          })),
        });
      }
    } finally {
      set({ loading: false });
    }
  },
}));
