"use client";
import { useState, useEffect } from "react";
import { CreateClientDto, Client } from "@/types/client";
import { PLATFORMS } from "@/constants/platforms";
import { CURRENCIES } from "@/constants/currencies";
import { useWorkspaceStore } from "@/store/workspaceStore";

const STATUSES: { value: Client["status"]; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "churned", label: "Churned" },
];

const empty = (): CreateClientDto => ({
  name: "",
  email: "",
  phone: "",
  company: "",
  platform: "DIRECT",
  status: "active",
  totalRevenue: 0,
  currency: "USD",
  notes: "",
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientDto) => Promise<void>;
  initial?: Client | null;
}

export default function AddClientModal({ open, onClose, onSubmit, initial }: Props) {
  const members = useWorkspaceStore((s) => s.members);
  const [form, setForm] = useState<CreateClientDto>(empty());
  const [errors, setErrors] = useState<Partial<Record<keyof CreateClientDto, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        name: initial.name,
        email: initial.email,
        phone: initial.phone ?? "",
        company: initial.company ?? "",
        platform: initial.platform,
        status: initial.status,
        totalRevenue: initial.totalRevenue,
        currency: initial.currency,
        notes: initial.notes ?? "",
      } : empty());
      setErrors({});
    }
  }, [open, initial]);

  if (!open) return null;

  const set = <K extends keyof CreateClientDto>(k: K, v: CreateClientDto[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    await onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral/10 flex-shrink-0">
          <div>
            <p className="font-display font-bold text-primary text-base">
              {initial ? "Edit Client" : "Add New Client"}
            </p>
            <p className="text-neutral text-xs mt-0.5">
              {initial ? "Update client details" : "Track a new client or contact"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-light transition-colors text-neutral">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1">

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" error={errors.name} required>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Sarah Johnson"
                className={inputCls(!!errors.name)}
              />
            </Field>
            <Field label="Email" error={errors.email} required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="sarah@example.com"
                className={inputCls(!!errors.email)}
              />
            </Field>
          </div>

          {/* Phone + Company */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 234 567 8900"
                className={inputCls(false)}
              />
            </Field>
            <Field label="Company">
              <input
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Acme Inc."
                className={inputCls(false)}
              />
            </Field>
          </div>

          {/* Platform + Status */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Platform">
              <select
                value={form.platform}
                onChange={(e) => set("platform", e.target.value as CreateClientDto["platform"])}
                className={inputCls(false)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as CreateClientDto["status"])}
                className={inputCls(false)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Revenue + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Revenue">
              <input
                type="number"
                min={0}
                value={form.totalRevenue ?? 0}
                onChange={(e) => set("totalRevenue", Number(e.target.value))}
                placeholder="0"
                className={inputCls(false)}
              />
            </Field>
            <Field label="Currency">
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value as CreateClientDto["currency"])}
                className={inputCls(false)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any extra context or notes..."
              rows={3}
              className={`${inputCls(false)} resize-none`}
            />
          </Field>

          {/* Assign To */}
          <Field label="Assign To">
            <select value={form.assignedTo ?? ""} onChange={(e) => set("assignedTo", e.target.value)} className={inputCls(false)}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral/10 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-neutral/20 text-primary text-sm font-semibold rounded-xl hover:bg-neutral-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            {initial ? "Save Changes" : "Add Client"}
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
