"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthStore } from "@/store/authStore";

const SLAB_INFO: Record<string, { leads: number; clients: number }> = {
  "1–5 clients":    { leads: 50,  clients: 5 },
  "6–20 clients":   { leads: 100, clients: 20 },
  "21–50 clients":  { leads: 150, clients: 50 },
  "51–100 clients": { leads: 200, clients: 100 },
  "100+ clients":   { leads: 300, clients: 100 },
};

export default function DemoBanner({ onLoaded }: { onLoaded?: () => void }) {
  const { user: clerkUser } = useUser();
  const storeUser = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (storeUser?.role !== "owner") return null;

  const slab = (clerkUser?.unsafeMetadata?.estimatedClients as string) ?? "1–5 clients";
  const info = SLAB_INFO[slab] ?? SLAB_INFO["1–5 clients"];

  async function loadDemo() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/demo", { method: "POST" }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) {
      setDone(true);
      onLoaded?.();
    } else {
      setError(data?.error ?? "Failed to load demo data.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/10 border border-secondary/25 text-sm">
        <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
        <p className="text-primary font-medium">Demo data loaded — <strong>{info.leads} leads</strong> & <strong>{info.clients} clients</strong> added. Refresh to see them.</p>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white border border-neutral/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div>
          <p className="text-primary text-sm font-semibold">See Dealflow in action</p>
          <p className="text-neutral text-xs mt-0.5">Load <strong>{info.leads} sample leads</strong> & <strong>{info.clients} clients</strong> based on your agency size. Delete anytime.</p>
          {error && <p className="text-tertiary text-xs mt-1">{error}</p>}
        </div>
      </div>
      <button
        onClick={loadDemo}
        disabled={loading}
        className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-secondary px-4 py-2.5 rounded-xl font-semibold text-xs transition-all hover:bg-secondary hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Loading..." : "Load Demo Data"}
      </button>
    </div>
  );
}
