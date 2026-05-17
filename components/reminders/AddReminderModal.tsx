"use client";
import { useState, useEffect } from "react";
import type { Reminder, CreateReminderDto, ReminderChannel, ReminderFrequency, ReminderType } from "@/types/reminder";
import { useLeadStore } from "@/store/leadStore";
import { useClientStore } from "@/store/clientStore";

const FREQUENCIES: { value: ReminderFrequency; label: string }[] = [
  { value: "once", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "every2days", label: "Every 2 Days" },
  { value: "every3days", label: "Every 3 Days" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const CHANNELS: { value: ReminderChannel; label: string; icon: string }[] = [
  { value: "email", label: "Email", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" },
  { value: "whatsapp", label: "WhatsApp", icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" },
  { value: "in-app", label: "In-App", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" },
];

const TYPES: { value: ReminderType; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "client", label: "Client" },
  { value: "custom", label: "Custom" },
];

const inputCls = (err?: string) =>
  `w-full bg-neutral-light text-primary text-sm placeholder:text-neutral/50 px-3 py-2.5 rounded-xl border focus:outline-none focus:border-secondary/50 transition-colors ${err ? "border-tertiary/50" : "border-transparent"}`;

const empty = (): CreateReminderDto => ({
  title: "",
  description: "",
  type: "custom",
  linkedId: "",
  linkedName: "",
  channels: ["in-app"],
  frequency: "every3days",
  nextReminderAt: new Date().toISOString().slice(0, 10),
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReminderDto) => void;
  initial?: Reminder | null;
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
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

export default function AddReminderModal({ open, onClose, onSubmit, initial }: Props) {
  const leads = useLeadStore((s) => s.leads);
  const clients = useClientStore((s) => s.clients);

  const [form, setForm] = useState<CreateReminderDto>(empty());
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        title: initial.title,
        description: initial.description ?? "",
        type: initial.type,
        linkedId: initial.linkedId ?? "",
        linkedName: initial.linkedName ?? "",
        channels: initial.channels,
        frequency: initial.frequency,
        nextReminderAt: initial.nextReminderAt.slice(0, 10),
      } : empty());
      setErrors({});
    }
  }, [open, initial]);

  const set = <K extends keyof CreateReminderDto>(k: K, v: CreateReminderDto[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleChannel = (ch: ReminderChannel) =>
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch],
    }));

  const validate = () => {
    const e: Partial<Record<string, string>> = {};
    if (!form.title.trim()) e.title = "Title required";
    if (form.channels.length === 0) e.channels = "Pick at least one channel";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, nextReminderAt: new Date(form.nextReminderAt).toISOString() });
    onClose();
  };

  const linkedOptions = form.type === "lead"
    ? leads.map((l) => ({ id: l.id, name: l.clientName }))
    : form.type === "client"
    ? clients.map((c) => ({ id: c._id, name: c.name }))
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral/8">
          <p className="font-display font-bold text-primary text-sm">{initial ? "Edit Reminder" : "New Reminder"}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-light text-neutral transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Title */}
          <Field label="Title" required error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Follow up with Ahmed"
              className={inputCls(errors.title)}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className={`${inputCls()} resize-none`}
            />
          </Field>

          {/* Type */}
          <Field label="Type" required>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => { set("type", t.value); set("linkedId", ""); set("linkedName", ""); }}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors ${form.type === t.value ? "bg-primary text-white border-primary" : "bg-white border-neutral/20 text-neutral hover:text-primary"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Linked entity */}
          {(form.type === "lead" || form.type === "client") && linkedOptions.length > 0 && (
            <Field label={form.type === "lead" ? "Link to Lead" : "Link to Client"}>
              <select
                value={form.linkedId}
                onChange={(e) => {
                  const opt = linkedOptions.find((o) => o.id === e.target.value);
                  set("linkedId", e.target.value);
                  set("linkedName", opt?.name ?? "");
                }}
                className={inputCls()}
              >
                <option value="">None</option>
                {linkedOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Frequency */}
          <Field label="Frequency" required>
            <div className="grid grid-cols-3 gap-1.5">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => set("frequency", f.value)}
                  className={`text-[11px] font-semibold py-2 rounded-xl border transition-colors ${form.frequency === f.value ? "bg-secondary/15 text-secondary border-secondary/30" : "bg-white border-neutral/15 text-neutral hover:text-primary"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Next reminder date */}
          <Field label="Next Reminder Date" required>
            <input
              type="date"
              value={form.nextReminderAt}
              onChange={(e) => set("nextReminderAt", e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className={inputCls()}
            />
          </Field>

          {/* Channels */}
          <Field label="Notify via" required error={errors.channels}>
            <div className="flex gap-2">
              {CHANNELS.map((ch) => {
                const active = form.channels.includes(ch.value);
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => toggleChannel(ch.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] font-semibold transition-colors ${active ? "bg-secondary/10 border-secondary/30 text-secondary" : "bg-white border-neutral/15 text-neutral hover:text-primary"}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      {ch.icon.split(" M").map((d, i) => (
                        <path key={i} d={i === 0 ? d : `M${d}`} />
                      ))}
                    </svg>
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-neutral/20 text-primary text-sm font-semibold rounded-xl hover:bg-neutral-light transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              {initial ? "Save Changes" : "Add Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
