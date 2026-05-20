"use client";
import { useState, useEffect, Suspense } from "react";
import { useSignIn, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import loginSvg from "../../assets/login.svg";
import updateLogo from "@/components/landing/assests/update logo.png";

function LoginContent() {
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";

  useEffect(() => {
    if (isSignedIn) router.replace(redirectTo || "/dashboard");
  }, [isSignedIn, router, redirectTo]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function syncUser() {
    await fetch("/api/auth/sync", { method: "POST" });
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (fetchStatus === "fetching" || !signIn) return;
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn!.create({ identifier: email, password });
      if (error) {
        setError(error.message ?? "Invalid email or password.");
        setLoading(false);
        return;
      }
      if (signIn!.status === "complete") {
        await setActive({ session: signIn!.createdSessionId });
        await syncUser();
        router.push(redirectTo || "/dashboard");
      } else {
        setError("Sign in incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr?.errors?.[0]?.message ?? "Invalid email or password.");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    if (fetchStatus === "fetching" || !signIn) return;
    try {
      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectCallbackUrl: redirectTo || "/dashboard",
      });
      if (error) setError(error.message ?? "Google sign-in failed.");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      if (clerkErr?.errors?.[0]?.message) setError(clerkErr.errors[0].message);
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* Left — sticky branding panel */}
      <div className="hidden lg:flex lg:w-[45%] sticky top-0 h-screen bg-primary flex-col p-12 relative overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[340px] h-[340px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-[260px] h-[260px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)" }} />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 flex-shrink-0">
          <Image src={updateLogo} alt="Dealflow" width={36} height={36} className="object-contain flex-shrink-0" />
          <span className="font-display font-bold text-xl tracking-tight text-white">DEAL<span className="text-secondary">FLOW</span></span>
        </Link>

        <div className="relative z-10 flex-1 flex items-center justify-center py-8">
          <Image src={loginSvg} alt="Login illustration" width={340} height={340} unoptimized className="w-full max-w-xs opacity-90" />
        </div>

        <div className="relative z-10 flex-shrink-0 space-y-6">
          <div className="space-y-3">
            <h2 className="font-display font-bold text-white leading-tight" style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)" }}>
              Welcome back.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Your deals, clients, and pipeline — all in one place.
            </p>
          </div>
          <div className="flex gap-8">
            {[{ value: "500+", label: "Teams" }, { value: "$12M+", label: "Revenue tracked" }, { value: "98%", label: "Retention" }].map((s) => (
              <div key={s.label}>
                <p className="font-display font-bold text-secondary text-xl">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs">© 2026 Dealflow. All rights reserved.</p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white min-h-screen">
        <div className="w-full max-w-md">

          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <Image src={updateLogo} alt="Dealflow" width={32} height={32} className="object-contain flex-shrink-0" />
            <span className="font-display font-bold text-lg tracking-tight text-primary">DEAL<span className="text-secondary">FLOW</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display font-bold text-primary text-3xl">Sign in</h1>
            <p className="text-neutral text-sm mt-2">Enter your credentials to access your workspace.</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-tertiary/10 border border-tertiary/25 text-tertiary text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral/20 bg-neutral-light text-primary text-sm placeholder:text-neutral/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-primary uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-secondary hover:text-secondary/80 font-medium transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral/20 bg-neutral-light text-primary text-sm placeholder:text-neutral/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral hover:text-primary transition-colors">
                  {showPassword
                    ? <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in to Dealflow"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral/15" />
              <span className="text-neutral text-xs">or continue with</span>
              <div className="flex-1 h-px bg-neutral/15" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={!signIn || fetchStatus === "fetching"}
              className="w-full py-3 border border-neutral/20 rounded-xl flex items-center justify-center gap-2.5 text-sm font-medium text-primary hover:bg-neutral-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {!signIn || fetchStatus === "fetching" ? "Loading..." : "Continue with Google"}
            </button>
          </form>

          <p className="text-center text-sm text-neutral mt-8">
            Don&apos;t have an account?{" "}
            <Link href={`/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-secondary font-semibold hover:text-secondary/80 transition-colors">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginContent />
    </Suspense>
  );
}
