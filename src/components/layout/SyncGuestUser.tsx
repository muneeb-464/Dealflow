"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

interface GuestData {
  token: string;
  workspaceId: string;
  workspaceName: string;
  role: "invite_guest";
  email: string;
  name: string;
  expiresAt: string;
}

function parseGuestCookie(): GuestData | null {
  try {
    const match = document.cookie.split("; ").find((c) => c.startsWith("dealflow-guest="));
    if (!match) return null;
    const value = match.split("=").slice(1).join("=");
    return JSON.parse(atob(value)) as GuestData;
  } catch {
    return null;
  }
}

export default function SyncGuestUser() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return; // Clerk user already set
    const guest = parseGuestCookie();
    if (!guest) return;

    // Check if expired
    if (new Date(guest.expiresAt) < new Date()) {
      document.cookie = "dealflow-guest=; path=/; max-age=0";
      return;
    }

    setAuth("guest-session", {
      id: `guest-${guest.token.slice(0, 8)}`,
      name: "Guest",
      email: guest.email,
      role: "invite_guest",
    });
  }, [isAuthenticated, setAuth]);

  return null;
}
