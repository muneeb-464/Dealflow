"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function DeleteDemoButton({ onDeleted }: { onDeleted?: () => void }) {
  const storeUser = useAuthStore((s) => s.user);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (storeUser?.role !== "owner") return null;

  async function handleDelete() {
    setLoading(true);
    const res = await fetch("/api/demo", { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setConfirm(false);
      onDeleted?.();
      window.location.reload();
    }
    setLoading(false);
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral">Delete all demo data permanently?</span>
        <button onClick={handleDelete} disabled={loading} className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60">
          {loading ? "Deleting..." : "Yes, delete"}
        </button>
        <button onClick={() => setConfirm(false)} className="px-3 py-1.5 border border-neutral/20 text-neutral text-xs font-semibold rounded-lg hover:bg-neutral-light transition-colors">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="inline-flex items-center gap-1.5 text-xs text-neutral hover:text-red-500 transition-colors font-medium"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
      Delete Demo Data
    </button>
  );
}
