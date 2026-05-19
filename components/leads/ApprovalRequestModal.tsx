"use client";
import { useState } from "react";

interface ApprovalRequestModalProps {
  leadName: string;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export default function ApprovalRequestModal({ leadName, onClose, onConfirm }: ApprovalRequestModalProps) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    await onConfirm(note);
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-display font-bold text-primary text-base">Send Approval Request</p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral hover:bg-neutral-light transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-tertiary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <p className="text-primary text-sm font-semibold mb-1">
          Delete lead: <span className="text-tertiary">{leadName}</span>
        </p>
        <p className="text-neutral text-xs mb-4">
          Deleting leads requires owner approval. Sending a request will notify the workspace owner.
        </p>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-primary mb-1.5">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why should this lead be deleted?"
            rows={3}
            className="w-full bg-neutral-light text-primary text-sm placeholder:text-neutral/50 px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-neutral/20 text-primary font-semibold text-sm rounded-xl hover:bg-neutral-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 py-2.5 bg-tertiary text-white font-semibold text-sm rounded-xl hover:bg-tertiary/90 transition-colors disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
