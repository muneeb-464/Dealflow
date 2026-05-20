"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export type GrantablePage = "revenue" | "analytics" | "team" | "settings";

interface Grant {
  _id: string;
  page: GrantablePage;
  status: "pending" | "approved" | "rejected";
}

let cache: Grant[] | null = null;
let cacheFor: string | null = null;

export function usePageAccess() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "employee";
  const [grants, setGrants] = useState<Grant[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null && role === "employee");

  useEffect(() => {
    if (role !== "employee") return;
    const key = user?.id ?? "";
    if (cache && cacheFor === key) { setGrants(cache); setLoading(false); return; }

    fetch("/api/workspace/page-access")
      .then((r) => r.json())
      .then((d) => {
        const g: Grant[] = d.grants ?? [];
        cache = g;
        cacheFor = key;
        setGrants(g);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, user?.id]);

  function hasAccess(page: GrantablePage): boolean {
    if (role === "owner" || role === "manager") return true;
    return grants.some((g) => g.page === page && g.status === "approved");
  }

  function getStatus(page: GrantablePage): "approved" | "pending" | "rejected" | "none" {
    const g = grants.find((g) => g.page === page);
    return g?.status ?? "none";
  }

  function invalidate() {
    cache = null;
    cacheFor = null;
  }

  return { hasAccess, getStatus, loading, invalidate };
}
