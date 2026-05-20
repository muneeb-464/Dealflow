"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

type GuestState = "idle" | "joining" | "done" | "error";

type State = "loading" | "ready" | "accepting" | "success" | "error" | "auth_required";

interface InviteInfo {
  workspaceName: string;
  inviterName: string;
  role: string;
  expiresAt: string;
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-light flex items-center justify-center"><p className="text-neutral text-sm">Loading...</p></div>}>
      <InviteContent />
    </Suspense>
  );
}

function InviteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const token = params.get("token");

  const [state, setState] = useState<State>("loading");
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState("");
  const [guestState, setGuestState] = useState<GuestState>("idle");

  useEffect(() => {
    if (!isLoaded) return;
    if (!token) { setState("error"); setError("Invalid invite link — no token found."); return; }

    fetch(`/api/workspace/invite/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          if (isSignedIn) {
            // Signed-in user — hard error (expired, used, etc.)
            setState("error"); setError(d.error);
          } else {
            // Not signed in — still show auth_required so guest path works
            setState("auth_required");
          }
          return;
        }
        setInfo(d);
        setState(isSignedIn ? "ready" : "auth_required");
      })
      .catch(() => {
        if (isSignedIn) {
          setState("error"); setError("Failed to load invite details.");
        } else {
          // Network/server error — still let unauthenticated users try guest path
          setState("auth_required");
        }
      });
  }, [isLoaded, isSignedIn, token]);

  async function acceptInvite() {
    setState("accepting");
    try {
      const res = await fetch("/api/workspace/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) { setState("error"); setError(data.error ?? "Failed to accept invite."); return; }
      setState("success");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setState("error");
      setError("Something went wrong. Please try again.");
    }
  }

  async function joinAsGuest() {
    setGuestState("joining");
    try {
      const res = await fetch("/api/guest/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) { setGuestState("error"); setError(data.error ?? "Failed to start guest session."); return; }
      setGuestState("done");
      router.push("/dashboard");
    } catch {
      setGuestState("error");
      setError("Something went wrong. Please try again.");
    }
  }

  const roleLabel = (r: string) => r.charAt(0).toUpperCase() + r.slice(1);

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

          {/* Loading */}
          {(state === "loading") && (
            <div className="py-8">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="font-display font-bold text-primary">Checking invite...</p>
            </div>
          )}

          {/* Auth required */}
          {state === "auth_required" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/25 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h1 className="font-display font-bold text-primary text-2xl mb-2">You have an invite!</h1>
              {info && (
                <p className="text-neutral text-sm leading-relaxed mb-2">
                  You&apos;ve been invited to join <strong className="text-primary">{info.workspaceName}</strong> as a{" "}
                  <span className="text-secondary font-semibold capitalize">{info.role}</span> by{" "}
                  <strong className="text-primary">{info.inviterName}</strong>.
                </p>
              )}
              <p className="text-neutral/60 text-xs mb-5">Choose how to join:</p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={joinAsGuest}
                  disabled={guestState === "joining" || guestState === "done"}
                  className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
                >
                  {guestState === "joining" ? "Opening dashboard..." : "Continue as Guest"}
                </button>

                <div className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px bg-neutral/15" />
                  <span className="text-neutral/50 text-[11px]">or sign in for full access</span>
                  <div className="flex-1 h-px bg-neutral/15" />
                </div>

                <Link
                  href={`/login?redirect=/invite?token=${token}`}
                  className="w-full py-3 border border-neutral/20 text-primary font-semibold text-sm rounded-xl hover:bg-neutral-light transition-colors text-center"
                >
                  Sign in to accept permanently
                </Link>
                <Link
                  href={`/register?redirect=/invite?token=${token}`}
                  className="w-full py-3 border border-neutral/15 text-neutral font-medium text-sm rounded-xl hover:bg-neutral-light transition-colors text-center"
                >
                  Create account
                </Link>
              </div>

              {guestState === "error" && (
                <p className="text-tertiary text-xs mt-4">{error}</p>
              )}

              <p className="text-neutral/40 text-[11px] mt-4">
                Guest sessions expire with the invite link.
              </p>
            </>
          )}

          {/* Ready to accept */}
          {state === "ready" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/25 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h1 className="font-display font-bold text-primary text-2xl mb-2">Workspace Invitation</h1>
              {info ? (
                <p className="text-neutral text-sm leading-relaxed mb-2">
                  You&apos;ve been invited to join <strong className="text-primary">{info.workspaceName}</strong> as a{" "}
                  <span className="text-secondary font-semibold">{roleLabel(info.role)}</span> by{" "}
                  <strong className="text-primary">{info.inviterName}</strong>.
                </p>
              ) : (
                <p className="text-neutral text-sm leading-relaxed mb-2">
                  Click below to accept your workspace invitation.
                </p>
              )}
              <p className="text-neutral/50 text-xs mb-6">Invite link expires in 48 hours.</p>
              <button
                onClick={acceptInvite}
                className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Accept Invitation
              </button>
            </>
          )}

          {/* Accepting */}
          {state === "accepting" && (
            <div className="py-8">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-display font-bold text-primary">Joining workspace...</p>
            </div>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="py-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/25 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-secondary" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="font-display font-bold text-primary text-2xl mb-2">You&apos;re in!</h1>
              <p className="text-neutral text-sm">Workspace joined successfully. Redirecting to dashboard...</p>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-tertiary/10 border border-tertiary/25 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-tertiary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h1 className="font-display font-bold text-primary text-xl mb-2">Invalid Invite</h1>
              <p className="text-neutral text-sm mb-6">{error}</p>
              <Link href="/" className="text-sm text-secondary font-semibold hover:underline">Go to homepage</Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
