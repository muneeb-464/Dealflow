import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "owner" | "manager" | "employee" | "invite_guest";

interface AuthStore {
  isAuthenticated: boolean;
  isSynced: boolean;
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
  } | null;
  setAuth: (token: string, user: AuthStore["user"]) => void;
  clearAuth: () => void;
  setSynced: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isSynced: false,
      token: null,
      user: null,
      setAuth: (token, user) => set({ isAuthenticated: true, token, user }),
      clearAuth: () => set({ isAuthenticated: false, token: null, user: null, isSynced: false }),
      setSynced: () => set({ isSynced: true }),
    }),
    {
      name: "dealflow-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
