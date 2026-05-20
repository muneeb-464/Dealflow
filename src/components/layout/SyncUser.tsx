"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const POLL_INTERVAL_MS = 30_000;

export default function SyncUser() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const removedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn) return;

    const sync = async () => {
      if (removedRef.current) return;

      const syncRes = await fetch("/api/auth/sync", { method: "POST" }).catch(() => null);
      const syncData = await syncRes?.json().catch(() => null);

      if (syncData?.user) {
        const { id, name, email, avatar, role } = syncData.user;
        setAuth("clerk-session", { id, name, email, avatar, role: role ?? "employee" });
      }

      // No active workspace — removed from workspace or never set up
      if (syncData?.user && !syncData.user.activeWorkspaceId) {
        removedRef.current = true;
        clearAuth();
        router.replace("/workspace-setup?reason=removed");
        return;
      }

      // Agency users without workspace: redirect to setup
      if (syncData?.user?.accountType !== "freelancer") {
        const wsRes = await fetch("/api/workspace").catch(() => null);
        if (wsRes?.ok) {
          const wsData = await wsRes.json().catch(() => null);
          if (!wsData?.workspace) router.replace("/workspace-setup");
        }
      }
    };

    sync();
    const interval = setInterval(sync, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isSignedIn, router, setAuth, clearAuth]);

  return null;
}
