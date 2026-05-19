import { create } from "zustand";

type Role = "owner" | "manager" | "employee" | "invite_guest";

interface AuthStore {
  isAuthenticated: boolean;
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
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: true,
  token: "mock-token",
  user: {
    id: "m1",
    name: "Muneeb Ahmed",
    email: "464muneeb@gmail.com",
    role: "owner",
  },
  setAuth: (token, user) => set({ isAuthenticated: true, token, user }),
  clearAuth: () => set({ isAuthenticated: false, token: null, user: null }),
}));
