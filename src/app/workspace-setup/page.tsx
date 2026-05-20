"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const CURRENCIES = ["USD", "PKR", "EUR", "GBP", "AED", "CAD", "AUD"] as const;
const TIMEZONES = [
  { value: "Asia/Karachi", label: "Pakistan (PKT, UTC+5)" },
  { value: "America/New_York", label: "New York (EST, UTC-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST, UTC-8)" },
  { value: "Europe/London", label: "London (GMT, UTC+0)" },
  { value: "Europe/Berlin", label: "Berlin (CET, UTC+1)" },
  { value: "Asia/Dubai", label: "Dubai (GST, UTC+4)" },
  { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT, UTC+11)" },
];

function WorkspaceSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const removed = searchParams.get("reason") === "removed";

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Workspace name is required."); return; }
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/sync", { method: "POST" });
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), currency, timezone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create workspace.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-primary">DEAL<span className="text-secondary">FLOW</span></span>
        </Link>

        {/* Removed from workspace banner */}
        {removed && (
          <div className="mb-5 flex items-start gap-3 px-4 py-4 rounded-2xl bg-tertiary/10 border border-tertiary/25">
            <div className="w-8 h-8 rounded-xl bg-tertiary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-tertiary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="text-tertiary font-semibold text-sm">You were removed from your workspace</p>
              <p className="text-tertiary/70 text-xs mt-0.5">Your access has been revoked by the workspace owner. Create your own workspace below or request a new invite link.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-neutral/8 p-8">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm font-bold font-display">{initials}</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-primary text-2xl leading-tight">
                {removed ? "Create your own workspace" : "Set up your workspace"}
              </h1>
              <p className="text-neutral text-sm mt-0.5">
                {removed ? "Start fresh with your own team." : "One last step — configure your team workspace."}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-tertiary/10 border border-tertiary/25 text-tertiary text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Workspace name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider">
                Workspace Name <span className="text-tertiary">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. NexGen Agency, MyBusiness"
                className="w-full px-4 py-3 rounded-xl border border-neutral/20 bg-neutral-light text-primary text-sm placeholder:text-neutral/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all"
              />
              <p className="text-neutral text-xs">This will be your team&apos;s home inside Dealflow.</p>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider">Default Currency</label>
              <div className="grid grid-cols-4 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      currency === c
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-neutral/20 text-neutral hover:border-secondary/40 hover:text-primary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral/20 bg-neutral-light text-primary text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating workspace..." : "Create workspace & continue"}
            </button>
          </form>

          {!removed && (
            <>
              <div className="flex items-center gap-2 mt-6 justify-center">
                <div className="w-6 h-1.5 rounded-full bg-secondary/30" />
                <div className="w-6 h-1.5 rounded-full bg-secondary/30" />
                <div className="w-6 h-1.5 rounded-full bg-secondary" />
              </div>
              <p className="text-center text-xs text-neutral mt-2">Step 3 of 3</p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function WorkspaceSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-light" />}>
      <WorkspaceSetupContent />
    </Suspense>
  );
}
