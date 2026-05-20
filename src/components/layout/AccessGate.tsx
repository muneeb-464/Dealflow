"use client";
import { useState } from "react";
import { usePageAccess, type GrantablePage } from "@/hooks/usePageAccess";
import { useAuthStore } from "@/store/authStore";

const PAGE_LABELS: Record<GrantablePage, string> = {
  revenue:   "Revenue",
  analytics: "Analytics",
  team:      "Team",
  settings:  "Settings",
};

const PAGE_ICONS: Record<GrantablePage, string> = {
  revenue:   "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  analytics: "M18 20V10 M12 20V4 M6 20v-6",
  team:      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
};

interface Props {
  page: GrantablePage;
  children: React.ReactNode;
}

export default function AccessGate({ page, children }: Props) {
  const user = useAuthStore((s) => s.user);
  const { hasAccess, getStatus, loading, invalidate } = usePageAccess();
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasAccess(page)) return <>{children}</>;

  const status = getStatus(page);

  async function handleRequest() {
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/workspace/page-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, note }),
      });
      if (!res.ok) {
        const d = await res.json();
        setToast(d.error ?? "Failed to send request");
      } else {
        invalidate();
        setToast("Request sent — waiting for owner approval");
        // re-fetch grants to update status
        setTimeout(() => {
          invalidate();
          window.location.reload();
        }, 1500);
      }
    } catch {
      setToast("Failed to send request");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-3xl shadow-sm border border-neutral/8 p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral/8 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d={PAGE_ICONS[page]} />
          </svg>
        </div>

        <h2 className="font-display font-bold text-primary text-lg mb-1">{PAGE_LABELS[page]}</h2>
        <p className="text-neutral text-sm mb-6">Access restricted. Request permission from workspace owner.</p>

        {status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-amber-700 text-sm font-semibold">
            Request pending — awaiting owner approval
          </div>
        )}

        {status === "rejected" && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-semibold">
              Request rejected. You can submit a new request.
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)..."
              rows={3}
              className="w-full bg-neutral-light text-primary text-sm px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 resize-none"
            />
            <button
              onClick={handleRequest}
              disabled={sending}
              className="w-full py-3 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {sending ? "Sending..." : "Re-request Access"}
            </button>
          </div>
        )}

        {status === "none" && (
          <div className="space-y-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the owner (optional)..."
              rows={3}
              className="w-full bg-neutral-light text-primary text-sm px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 resize-none"
            />
            <button
              onClick={handleRequest}
              disabled={sending}
              className="w-full py-3 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {sending ? "Sending..." : "Request Access"}
            </button>
          </div>
        )}

        {toast && (
          <p className="mt-3 text-xs font-semibold text-secondary">{toast}</p>
        )}
      </div>
    </div>
  );
}
