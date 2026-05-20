"use client";
import { useState, useEffect } from "react";
import type { InviteMemberDto } from "@/types/user";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InviteMemberDto) => void;
}

const empty = (): InviteMemberDto => ({ name: "", email: "", role: "employee" });

const inputCls = (err?: string) =>
  `w-full bg-neutral-light text-primary text-sm placeholder:text-neutral/50 px-3 py-2.5 rounded-xl border focus:outline-none focus:border-secondary/50 transition-colors ${err ? "border-tertiary/50" : "border-transparent"}`;

export default function InviteMemberModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<InviteMemberDto>(empty());
  const [errors, setErrors] = useState<Partial<Record<keyof InviteMemberDto, string>>>({});

  useEffect(() => {
    if (open) { setForm(empty()); setErrors({}); }
  }, [open]);

  if (!open) return null;

  const set = <K extends keyof InviteMemberDto>(k: K, v: InviteMemberDto[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral/10">
          <div>
            <p className="font-display font-bold text-primary text-base">Invite Team Member</p>
            <p className="text-neutral text-xs mt-0.5">They will receive a pending invite</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-light transition-colors text-neutral">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">Full Name<span className="text-tertiary ml-0.5">*</span></label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ali Hassan" className={inputCls(errors.name)} />
            {errors.name && <p className="text-tertiary text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">Email<span className="text-tertiary ml-0.5">*</span></label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="ali@example.com" className={inputCls(errors.email)} />
            {errors.email && <p className="text-tertiary text-[11px] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">Role</label>
            <div className="flex gap-2">
              {(["manager", "employee"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => set("role", r)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-colors capitalize ${form.role === r ? "bg-primary text-white border-primary" : "border-neutral/20 text-neutral hover:border-primary/30"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-neutral/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-neutral/20 text-primary text-sm font-semibold rounded-xl hover:bg-neutral-light transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">Send Invite</button>
        </div>
      </div>
    </div>
  );
}
