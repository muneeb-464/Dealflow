"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Routes that require specific roles. If a role isn't listed, all roles can access.
const ROUTE_ROLES: Record<string, string[]> = {
  "/revenue": ["owner", "manager"],
  "/analytics": ["owner", "manager"],
  "/team": ["owner", "manager"],
  "/workspace": ["owner", "manager"],
  "/settings": ["owner"],
  "/clients": ["owner", "manager", "employee"], // invite_guest blocked
};

export default function RoleGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isSynced = useAuthStore((s) => s.isSynced);
  const role = user?.role ?? "employee";

  useEffect(() => {
    if (!isSynced) return; // wait for first sync before making role decisions
    const segment = "/" + pathname.split("/").filter(Boolean)[0];
    const allowed = ROUTE_ROLES[segment];
    if (allowed && !allowed.includes(role)) {
      router.replace(`/access-denied?page=${segment.slice(1)}&role=${role}`);
    }
  }, [pathname, role, isSynced, router]);

  return null;
}
