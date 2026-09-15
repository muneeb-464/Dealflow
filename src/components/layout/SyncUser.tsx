"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Re-sync picks up role changes / removal from a workspace. Each sync costs a Clerk API call
// plus DB reads, so poll only while the tab is visible, and re-sync when the user comes back.
const POLL_INTERVAL_MS = 60_000;
const MAX_RETRIES = 3;

export default function SyncUser() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setSynced = useAuthStore((s) => s.setSynced);
  const removedRef = useRef(false);
  const workspaceCheckedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn) return;

    const sync = async (attempt = 1) => {
      if (removedRef.current) return;

      const syncRes = await fetch("/api/auth/sync", { method: "POST" }).catch(() => null);
      const syncData = await syncRes?.json().catch(() => null);

      // Sync failed — retry up to MAX_RETRIES before giving up
      if (!syncRes?.ok || !syncData?.user) {
        if (attempt < MAX_RETRIES) {
          setTimeout(() => sync(attempt + 1), 1500 * attempt);
        } else {
          // All retries exhausted — mark synced so RoleGuard doesn't block forever
          setSynced();
        }
        return;
      }

      const { id, name, email, avatar, role } = syncData.user;
      setAuth("clerk-session", { id, name, email, avatar, role: role ?? "employee" });
      setSynced();

      // No active workspace — removed or never set up
      if (!syncData.user.activeWorkspaceId) {
        removedRef.current = true;
        clearAuth();
        router.replace("/workspace-setup?reason=removed");
        return;
      }

      // Agency users without workspace — only needs checking once per page load
      if (syncData.user.accountType !== "freelancer" && !workspaceCheckedRef.current) {
        workspaceCheckedRef.current = true;
        const wsRes = await fetch("/api/workspace").catch(() => null);
        if (wsRes?.ok) {
          const wsData = await wsRes.json().catch(() => null);
          if (!wsData?.workspace) router.replace("/workspace-setup");
        }
      }
    };

    sync();
    let lastSync = Date.now();

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      lastSync = Date.now();
      sync();
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastSync > POLL_INTERVAL_MS) {
        lastSync = Date.now();
        sync();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isSignedIn, router, setAuth, clearAuth, setSynced]);

  return null;
}
