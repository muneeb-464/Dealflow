"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthStore } from "@/store/authStore";
import AccessGate from "@/components/layout/AccessGate";
import DeleteDemoButton from "@/components/dashboard/DeleteDemoButton";

// ── Types ─────────────────────────────────────────────────────────────
type Section = "profile" | "freelancer" | "workspace" | "notifications" | "billing" | "security" | "danger";

const SECTIONS: { id: Section; label: string; icon: string; ownerOnly?: boolean }[] = [
  { id: "profile",       label: "Profile",       icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { id: "freelancer",    label: "Freelancer",     icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.09 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z" },
  { id: "workspace",     label: "Workspace",      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10", ownerOnly: true },
  { id: "notifications", label: "Notifications",  icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" },
  { id: "billing",       label: "Billing",        icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22", ownerOnly: true },
  { id: "security",      label: "Security",       icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "danger",        label: "Danger Zone",    icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01", ownerOnly: true },
];

const PLATFORMS = ["Upwork", "Fiverr", "LinkedIn", "Direct", "Referral", "WhatsApp", "Other"];
const CURRENCIES = ["PKR", "USD", "EUR", "GBP", "AED", "CAD", "AUD"];
const SERVICES   = ["Web Design", "Development", "SEO", "Content Writing", "Video Editing", "Branding", "Consulting", "Other"];

// ── Input helpers ──────────────────────────────────────────────────────
const inputCls = "w-full bg-neutral-light text-primary text-sm placeholder:text-neutral/50 px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 transition-colors";
const labelCls = "block text-xs font-semibold text-primary mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral/10 p-6 mb-5">
      <div className="mb-5 pb-4 border-b border-neutral/8">
        <p className="font-display font-bold text-primary text-base">{title}</p>
        {desc && <p className="text-neutral text-xs mt-1">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SaveBtn({ label = "Save Changes" }: { label?: string }) {
  return (
    <div className="flex justify-end pt-2">
      <button className="group inline-flex items-center gap-2 bg-primary text-secondary px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-lg hover:shadow-secondary/25 hover:scale-[1.02] active:scale-100">
        {label}
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" stroke="currentColor" strokeWidth={2.5}>
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative flex-shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-secondary" : "bg-neutral/20"}`}
      style={{ width: "44px", height: "26px" }}
    >
      <span
        className="absolute top-1 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
        style={{ left: "4px", transform: checked ? "translateX(18px)" : "translateX(0px)" }}
      />
    </button>
  );
}

// ── Section components ─────────────────────────────────────────────────
function ProfileSection() {
  const { user: clerkUser } = useUser();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoToast, setPhotoToast] = useState("");

  useEffect(() => {
    if (clerkUser?.fullName) setName(clerkUser.fullName);
  }, [clerkUser]);

  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? "";
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";
  const avatar = clerkUser?.imageUrl;

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !clerkUser) return;
    if (!file.type.startsWith("image/")) { setPhotoToast("Only image files allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoToast("Image must be under 5MB"); return; }
    setUploadingPhoto(true);
    try {
      await clerkUser.setProfileImage({ file });
      // Sync new avatar URL to DB
      await fetch("/api/auth/sync", { method: "POST" });
      setPhotoToast("Photo updated!");
    } catch {
      setPhotoToast("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setPhotoToast(""), 3000);
    }
  }

  return (
    <>
      {photoToast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white bg-primary">
          {photoToast}
        </div>
      )}
      <SectionCard title="Personal Information" desc="Your name and contact details.">
        <div className="flex items-center gap-5 mb-2">
          <div className="relative group flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-secondary text-lg">{initials}</span>
              </div>
            )}
            <label className={`absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${uploadingPhoto ? "bg-black/40" : "bg-black/0 group-hover:bg-black/35"}`}>
              {uploadingPhoto ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-primary">Profile photo</p>
            <p className="text-neutral text-xs mt-0.5">Hover to upload a new photo (max 5MB)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Email Address">
            <input type="email" value={email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
          </Field>
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="group inline-flex items-center gap-2 bg-primary text-secondary px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-lg hover:shadow-secondary/25 hover:scale-[1.02] active:scale-100 disabled:opacity-60"
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
            {!saving && !saved && (
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </SectionCard>
    </>
  );
}

function FreelancerSection() {
  const [currency, setCurrency]     = useState("USD");
  const [followUp, setFollowUp]     = useState("48");
  const [platforms, setPlatforms]   = useState<string[]>(["Upwork", "Fiverr"]);
  const [services, setServices]     = useState<string[]>(["Web Design"]);
  const [workStart, setWorkStart]   = useState("09:00");
  const [workEnd, setWorkEnd]       = useState("18:00");
  const [workDays, setWorkDays]     = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  return (
    <>
      <SectionCard title="Services & Platforms" desc="What you offer and where you find clients.">
        <Field label="Services You Offer">
          <div className="flex flex-wrap gap-2 mt-1">
            {SERVICES.map(s => (
              <button key={s} onClick={() => toggleArr(services, s, setServices)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${services.includes(s) ? "bg-primary text-secondary border-primary" : "bg-neutral-light text-neutral border-neutral/15 hover:border-secondary/40"}`}>
                {s}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Active Platforms">
          <div className="flex flex-wrap gap-2 mt-1">
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => toggleArr(platforms, p, setPlatforms)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${platforms.includes(p) ? "bg-primary text-secondary border-primary" : "bg-neutral-light text-neutral border-neutral/15 hover:border-secondary/40"}`}>
                {p}
              </button>
            ))}
          </div>
        </Field>
        <SaveBtn />
      </SectionCard>

      <SectionCard title="Defaults & Working Hours" desc="Auto-applied when creating new leads or reminders.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Default Currency">
            <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Default Follow-up Interval">
            <select value={followUp} onChange={e => setFollowUp(e.target.value)} className={inputCls}>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">3 days</option>
              <option value="120">5 days</option>
              <option value="168">1 week</option>
            </select>
          </Field>
          <Field label="Work Hours Start"><input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)} className={inputCls} /></Field>
          <Field label="Work Hours End"><input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Working Days">
          <div className="flex gap-2 mt-1 flex-wrap">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
              <button key={d} onClick={() => toggleArr(workDays, d, setWorkDays)}
                className={`w-12 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-200 ${workDays.includes(d) ? "bg-primary text-secondary border-primary" : "bg-neutral-light text-neutral border-neutral/15 hover:border-secondary/40"}`}>
                {d}
              </button>
            ))}
          </div>
        </Field>
        <SaveBtn />
      </SectionCard>
    </>
  );
}

function WorkspaceSection() {
  const [form, setForm] = useState({ name: "", timezone: "Asia/Karachi", currency: "USD" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/workspace")
      .then(r => r.json())
      .then(data => {
        if (data.workspace) {
          setForm({
            name: data.workspace.name ?? "",
            timezone: data.workspace.timezone ?? "Asia/Karachi",
            currency: data.workspace.currency ?? "USD",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SectionCard title="Workspace Settings" desc="Affects all team members in this workspace."><p className="text-neutral text-sm py-4 text-center">Loading...</p></SectionCard>;

  return (
    <SectionCard title="Workspace Settings" desc="Affects all team members in this workspace.">
      <Field label="Workspace Name"><input value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Timezone">
          <select value={form.timezone} onChange={e => set("timezone", e.target.value)} className={inputCls}>
            {["Asia/Karachi","Asia/Dubai","Europe/London","America/New_York","America/Los_Angeles"].map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Default Currency">
          <select value={form.currency} onChange={e => set("currency", e.target.value)} className={inputCls}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="group inline-flex items-center gap-2 bg-primary text-secondary px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-lg hover:shadow-secondary/25 hover:scale-[1.02] active:scale-100 disabled:opacity-60"
        >
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
          {!saving && !saved && (
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </SectionCard>
  );
}

function NotificationsSection() {
  const [settings, setSettings] = useState({
    followupDue:    true,
    dealConverted:  true,
    newLead:        false,
    teamActivity:   false,
    weeklyDigest:   true,
    reminderEmails: true,
  });
  const toggle = (k: keyof typeof settings) => setSettings(s => ({ ...s, [k]: !s[k] }));

  const rows: { key: keyof typeof settings; label: string; desc: string }[] = [
    { key: "followupDue",    label: "Follow-up due",        desc: "Alert when a lead hasn't replied in your set interval" },
    { key: "dealConverted",  label: "Deal converted",        desc: "Notify when a lead is marked as Converted" },
    { key: "newLead",        label: "New lead assigned",     desc: "When a team member assigns a lead to you" },
    { key: "teamActivity",   label: "Team activity",         desc: "Updates from team members on shared leads" },
    { key: "weeklyDigest",   label: "Weekly digest",         desc: "Summary of pipeline activity every Monday" },
    { key: "reminderEmails", label: "Email reminders",       desc: "Receive follow-up reminders via email" },
  ];

  return (
    <SectionCard title="Notification Preferences" desc="Choose what triggers an alert or email.">
      <div className="space-y-4">
        {rows.map(r => (
          <div key={r.key} className="flex items-center justify-between gap-4 py-1">
            <div>
              <p className="text-primary text-sm font-semibold">{r.label}</p>
              <p className="text-neutral text-xs mt-0.5">{r.desc}</p>
            </div>
            <Toggle checked={settings[r.key]} onChange={() => toggle(r.key)} />
          </div>
        ))}
      </div>
      <SaveBtn label="Save Preferences" />
    </SectionCard>
  );
}

function BillingSection() {
  return (
    <>
      <SectionCard title="Current Plan" desc="Manage your subscription.">
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-neutral-light border border-neutral/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-display font-bold text-primary text-base">Free Plan</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-primary">Active</span>
            </div>
            <p className="text-neutral text-xs">Up to 50 leads/month · 1 workspace · No team members</p>
          </div>
          <button className="group flex-shrink-0 inline-flex items-center gap-1.5 bg-primary text-secondary px-5 py-2.5 rounded-full font-semibold text-xs transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-lg hover:shadow-secondary/25 hover:scale-105 active:scale-100">
            Upgrade to Pro
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {[
            { label: "Unlimited leads", included: false },
            { label: "Up to 10 team members", included: false },
            { label: "Full analytics", included: false },
            { label: "Revenue tracking + export", included: false },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 text-xs text-neutral/50">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              </svg>
              {f.label} — Pro only
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Billing History" desc="Your past invoices.">
        <div className="text-center py-6 text-neutral text-sm">No invoices yet. Upgrade to Pro to see billing history.</div>
      </SectionCard>
    </>
  );
}

function SecuritySection() {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <SectionCard title="Change Password" desc="Use a strong password you don't use elsewhere.">
        <Field label="Current Password"><input type="password" value={form.current} onChange={e => set("current", e.target.value)} placeholder="••••••••" className={inputCls} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New Password"><input type="password" value={form.newPass} onChange={e => set("newPass", e.target.value)} placeholder="••••••••" className={inputCls} /></Field>
          <Field label="Confirm Password"><input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="••••••••" className={inputCls} /></Field>
        </div>
        <SaveBtn label="Update Password" />
      </SectionCard>

      <SectionCard title="Active Sessions" desc="Devices currently signed in to your account.">
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-neutral-light border border-neutral/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div>
              <p className="text-primary text-xs font-semibold">This device</p>
              <p className="text-neutral text-[11px] mt-0.5">Chrome · Windows · Active now</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-primary">Current</span>
        </div>
        <button className="text-xs font-semibold text-neutral hover:text-primary transition-colors mt-2">Sign out all other devices</button>
      </SectionCard>
    </>
  );
}

function DangerSection() {
  const [exporting, setExporting] = useState(false);
  const [deletingWs, setDeletingWs] = useState(false);
  const [confirmWs, setConfirmWs] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/workspace/export");
      if (!res.ok) { showToast("Export failed. Try again."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dealflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteWorkspace() {
    setDeletingWs(true);
    try {
      const res = await fetch("/api/workspace", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Delete failed."); return; }
      window.location.href = "/workspace-setup?reason=deleted";
    } catch {
      showToast("Delete failed. Try again.");
    } finally {
      setDeletingWs(false);
      setConfirmWs(false);
    }
  }

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white bg-red-600">
          {toast}
        </div>
      )}

      {/* Delete workspace confirmation modal */}
      {confirmWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmWs(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <p className="font-display font-bold text-primary text-base mb-2">Delete Workspace?</p>
            <p className="text-neutral text-sm mb-5">This permanently deletes all leads, clients, team members, and workspace data. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmWs(false)} className="flex-1 py-2.5 border border-neutral/20 text-primary text-sm font-semibold rounded-xl hover:bg-neutral-light transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteWorkspace} disabled={deletingWs} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60">
                {deletingWs ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SectionCard title="Danger Zone" desc="These actions are permanent and cannot be undone.">
        <div className="space-y-3">

          {/* Demo data deletion */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral/10 bg-neutral-light">
            <div>
              <p className="text-primary text-sm font-semibold">Demo Data</p>
              <p className="text-neutral text-xs mt-0.5">Remove all sample leads and clients loaded during onboarding.</p>
            </div>
            <DeleteDemoButton />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral/10 bg-neutral-light">
            <div>
              <p className="text-primary text-sm font-semibold">Export All Data</p>
              <p className="text-neutral text-xs mt-0.5">Download all leads, clients, and revenue as CSV.</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-secondary hover:bg-secondary hover:text-primary transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-60"
            >
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral/10 bg-neutral-light">
            <div>
              <p className="text-primary text-sm font-semibold">Delete Workspace</p>
              <p className="text-neutral text-xs mt-0.5">Permanently delete this workspace and remove all team members.</p>
            </div>
            <button
              onClick={() => setConfirmWs(true)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 hover:scale-105 active:scale-100"
            >
              Delete Workspace
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral/10 bg-neutral-light">
            <div>
              <p className="text-primary text-sm font-semibold">Delete Account</p>
              <p className="text-neutral text-xs mt-0.5">Permanently delete your account. Contact support to proceed.</p>
            </div>
            <a
              href="mailto:support@dealflow.pk?subject=Account Deletion Request"
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 hover:scale-105 active:scale-100"
            >
              Contact Support
            </a>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
function SettingsPageInner() {
  const [active, setActive] = useState<Section>("profile");

  const authUser = useAuthStore((s) => s.user);
  const role = authUser?.role ?? "owner";
  const visible = SECTIONS.filter(s => !s.ownerOnly || role === "owner");

  const renderSection = () => {
    switch (active) {
      case "profile":       return <ProfileSection />;
      case "freelancer":    return <FreelancerSection />;
      case "workspace":     return <WorkspaceSection />;
      case "notifications": return <NotificationsSection />;
      case "billing":       return <BillingSection />;
      case "security":      return <SecuritySection />;
      case "danger":        return <DangerSection />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-light">
      {/* Page header */}
      <div className="bg-white border-b border-neutral/10 px-6 lg:px-8 py-5">
        <h1 className="font-display font-bold text-primary text-xl">Settings</h1>
        <p className="text-neutral text-xs mt-0.5">Manage your profile, workspace, and preferences</p>
      </div>

      <div className="flex flex-1 min-h-0 gap-0">

        {/* Side tabs */}
        <aside className="w-56 flex-shrink-0 bg-white border-r border-neutral/10 py-4 px-3">
          <nav className="space-y-0.5">
            {visible.map(s => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${active === s.id ? "bg-secondary/10 border border-secondary/25" : "border border-transparent hover:bg-neutral-light"}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${active === s.id ? "bg-secondary/20" : "bg-neutral-light group-hover:bg-white"}`}>
                  <svg viewBox="0 0 24 24" fill="none" className={`transition-colors ${active === s.id ? "text-secondary" : "text-neutral"}`} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "14px", height: "14px" }}>
                    <path d={s.icon} />
                  </svg>
                </div>
                <span className={`text-xs font-semibold transition-colors ${active === s.id ? "text-primary" : "text-neutral group-hover:text-primary"} ${s.id === "danger" && active !== s.id ? "text-red-400 group-hover:text-red-500" : ""}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
          <div className="max-w-2xl">
            {renderSection()}
          </div>
        </main>

      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <AccessGate page="settings"><SettingsPageInner /></AccessGate>;
}
