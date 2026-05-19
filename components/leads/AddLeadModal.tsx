"use client";
import { useState, useEffect } from "react";
import type { Lead } from "./LeadTable";
import type { LeadStatus } from "./LeadStatusBadge";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useIsAgency } from "@/hooks/useIsAgency";

const PLATFORMS = ["Upwork", "Fiverr", "LinkedIn", "Direct", "Referral", "WhatsApp", "Other"];
const STATUSES: LeadStatus[] = ["Sent", "Pending", "Follow-up", "Replied", "Converted", "Rejected"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, "id">) => void;
  editLead?: Lead | null;
}

const empty = (): Omit<Lead, "id"> => ({
  clientName: "",
  platform: "Upwork",
  amount: "",
  currency: "USD",
  status: "Sent",
  service: "",
  notes: "",
  sentAt: new Date().toISOString().slice(0, 10),
  assignedTo: "",
});

export default function AddLeadModal({ open, onClose, onSave, editLead }: Props) {
  const members = useWorkspaceStore((s) => s.members);
  const fetchMembers = useWorkspaceStore((s) => s.fetchMembers);
  const isAgency = useIsAgency();
  const [form, setForm] = useState(empty());
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (isAgency && members.length === 0) fetchMembers();
    if (editLead) {
      const { id: _id, ...rest } = editLead;
      setForm(rest);
    } else {
      setForm(empty());
    }
    setErrors({});
  }, [editLead, open, isAgency, fetchMembers, members.length]);

  if (!open) return null;

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.clientName.trim()) e.clientName = "Required";
    if (!form.service.trim()) e.service = "Required";
    if (!form.amount || isNaN(Number(form.amount))) e.amount = "Enter a valid number";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral/10 flex-shrink-0">
          <div>
            <p className="font-display font-bold text-primary text-base">{editLead ? "Edit Lead" : "Add New Lead"}</p>
            <p className="text-neutral text-xs mt-0.5">{editLead ? "Update lead details" : "Track a new proposal or outreach"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-light transition-colors text-neutral">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1">

          {/* Client name */}
          <Field label="Client / Company Name" error={errors.clientName} required>
            <input
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              placeholder="e.g. TechCorp Ltd"
              className={inputCls(!!errors.clientName)}
            />
          </Field>

          {/* Service offered */}
          <Field label="Service Offered" error={errors.service} required>
            <input
              value={form.service}
              onChange={(e) => set("service", e.target.value)}
              placeholder="e.g. Website redesign, SEO audit"
              className={inputCls(!!errors.service)}
            />
          </Field>

          {/* Platform + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Platform">
              <select value={form.platform} onChange={(e) => set("platform", e.target.value)} className={inputCls(false)}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value as LeadStatus)} className={inputCls(false)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          {/* Amount + Currency row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Proposed Amount" error={errors.amount} required>
              <input
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="1200"
                type="number"
                min={0}
                className={inputCls(!!errors.amount)}
              />
            </Field>
            <Field label="Currency">
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls(false)}>
                {["USD", "PKR", "EUR", "GBP", "AED", "CAD", "AUD"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* Date */}
          <Field label="Lead Sent Date">
            <input
              type="date"
              value={form.sentAt}
              onChange={(e) => set("sentAt", e.target.value)}
              className={inputCls(false)}
            />
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any extra context, requirements, or follow-up notes..."
              rows={3}
              className={`${inputCls(false)} resize-none`}
            />
          </Field>

          {/* Assign To — agency only */}
          {isAgency && (
            <Field label="Assign To">
              <select value={form.assignedTo ?? ""} onChange={(e) => set("assignedTo", e.target.value)} className={inputCls(false)}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.userId}>{m.name} ({m.role})</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral/10 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-neutral/20 text-primary text-sm font-semibold rounded-xl hover:bg-neutral-light transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            {editLead ? "Save Changes" : "Add Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-primary mb-1.5">
        {label}{required && <span className="text-tertiary ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-tertiary text-[11px] mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-neutral-light text-primary text-sm placeholder:text-neutral/50 px-3 py-2.5 rounded-xl border focus:outline-none focus:border-secondary/50 transition-colors ${hasError ? "border-tertiary/50" : "border-transparent"}`;
}
