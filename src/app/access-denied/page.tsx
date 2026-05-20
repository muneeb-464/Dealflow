"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const PAGE_LABELS: Record<string, string> = {
  revenue: "Revenue",
  analytics: "Analytics",
  team: "Team",
  settings: "Settings",
  workspace: "Workspace",
  "plans-billing": "Plans & Billing",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  employee: "Employee",
  invite_guest: "Invite Guest",
};

function AccessDeniedContent() {
  const params = useSearchParams();
  const router = useRouter();
  const page = params.get("page") ?? "";
  const role = params.get("role") ?? "employee";

  const pageLabel = PAGE_LABELS[page] ?? page.charAt(0).toUpperCase() + page.slice(1);
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-primary">DEAL<span className="text-secondary">FLOW</span></span>
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-neutral/8 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-tertiary/10 border border-tertiary/25 flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-tertiary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="font-display font-bold text-primary text-2xl mb-3">Access Restricted</h1>

          <p className="text-neutral text-sm leading-relaxed mb-2">
            {pageLabel
              ? <>You&apos;re trying to access <strong className="text-primary">{pageLabel}</strong> — this page is restricted for your role.</>
              : "This page is restricted for your role."
            }
          </p>

          <div className="inline-flex items-center gap-1.5 bg-tertiary/8 border border-tertiary/20 rounded-full px-3 py-1 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <span className="text-tertiary text-xs font-semibold">{roleLabel}</span>
          </div>

          <p className="text-neutral/70 text-xs mb-6">
            Contact your workspace owner to request access.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="w-full py-3 border border-neutral/20 text-primary font-semibold text-sm rounded-xl hover:bg-neutral-light transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <p className="text-neutral text-sm">Loading...</p>
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  );
}
