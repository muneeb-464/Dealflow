"use client";
import { useState, useEffect, Suspense } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import signupSvg from "../../assets/signup.svg";

type AccountType = "business" | "freelancer" | null;
type Step = 1 | 2 | 3;

const clientRanges = ["1–5 clients", "6–20 clients", "21–50 clients", "51–100 clients", "100+ clients"];
const OTP_LOCK_KEY = "otp_lock";
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour
const RESEND_COOLDOWN_S = 60;

function getOtpLock(): { attempts: number; lockedUntil: number | null } {
  try {
    const raw = localStorage.getItem(OTP_LOCK_KEY);
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };
  } catch { return { attempts: 0, lockedUntil: null }; }
}

function saveOtpLock(data: { attempts: number; lockedUntil: number | null }) {
  localStorage.setItem(OTP_LOCK_KEY, JSON.stringify(data));
}

function clearOtpLock() {
  localStorage.removeItem(OTP_LOCK_KEY);
}

function RegisterContent() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const isInviteFlow = redirectTo.includes("/invite");

  const [accountType, setAccountType] = useState<AccountType>(isInviteFlow ? "freelancer" : null);
  const [step, setStep] = useState<Step>(isInviteFlow ? 2 : 1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [estimatedClients, setEstimatedClients] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // OTP rate limiting
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  // Load lock state from localStorage on mount
  useEffect(() => {
    const lock = getOtpLock();
    if (lock.lockedUntil && lock.lockedUntil > Date.now()) {
      setLockedUntil(lock.lockedUntil);
      setOtpAttempts(lock.attempts);
    } else if (lock.lockedUntil) {
      clearOtpLock(); // expired
    }
  }, []);

  // Lock countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setOtpAttempts(0);
        setLockCountdown(0);
        clearOtpLock();
        clearInterval(interval);
      } else {
        setLockCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const passwordStrength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : password.length < 14 ? 3 : 4;
  const strengthColor = ["bg-neutral/15", "bg-tertiary", "bg-tertiary", "bg-secondary", "bg-secondary"];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];

  function fieldClass(hasError: boolean) {
    return `w-full px-4 py-3 rounded-xl border text-primary text-sm placeholder:text-neutral/50 focus:outline-none focus:ring-2 transition-all bg-neutral-light ${
      hasError ? "border-tertiary focus:border-tertiary focus:ring-tertiary/15" : "border-neutral/20 focus:border-secondary focus:ring-secondary/15"
    }`;
  }

  function validateStep2() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (accountType === "business") {
      if (!businessName.trim()) errs.businessName = "Business name is required.";
      if (!businessEmail.trim()) errs.businessEmail = "Business email is required.";
    }
    if (!businessPhone.trim()) errs.businessPhone = "Phone number is required.";
    if (!estimatedClients) errs.estimatedClients = "Please select an estimate.";
    return errs;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (fetchStatus === "fetching" || !signUp) return;
    const errs = validateStep2();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setGlobalError("");

    const [firstName, ...rest] = name.trim().split(" ");
    const { error: createErr } = await signUp.create({
      emailAddress: email,
      password,
      firstName,
      lastName: rest.join(" ") || undefined,
      unsafeMetadata: {
        accountType,
        businessName: accountType === "business" ? businessName : undefined,
        businessEmail: accountType === "business" ? businessEmail : undefined,
        phone: businessPhone,
        estimatedClients,
      },
    });

    if (createErr) {
      setGlobalError(createErr.message ?? "Registration failed.");
      setLoading(false);
      return;
    }

    const { error: sendErr } = await signUp.verifications.sendEmailCode();
    if (sendErr) {
      setGlobalError(sendErr.message ?? "Failed to send verification code.");
      setLoading(false);
      return;
    }

    setStep(3);
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.SyntheticEvent) {
    e.preventDefault();
    if (fetchStatus === "fetching" || !signUp) return;

    const lock = getOtpLock();
    if (lock.lockedUntil && lock.lockedUntil > Date.now()) {
      const mins = Math.ceil((lock.lockedUntil - Date.now()) / 60000);
      setGlobalError(`Too many wrong attempts. Try again in ${mins} minute${mins > 1 ? "s" : ""}.`);
      return;
    }

    setLoading(true);
    setGlobalError("");

    const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code: otpCode });

    if (verifyErr) {
      const msg = verifyErr.message ?? "Invalid code.";
      const newAttempts = (lock.attempts || 0) + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_DURATION_MS;
        saveOtpLock({ attempts: newAttempts, lockedUntil: until });
        setLockedUntil(until);
        setOtpAttempts(newAttempts);
        setGlobalError("Too many wrong attempts. Account locked for 1 hour.");
      } else {
        saveOtpLock({ attempts: newAttempts, lockedUntil: null });
        setOtpAttempts(newAttempts);
        setGlobalError(`${msg} (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining)`);
      }
      setLoading(false);
      return;
    }

    const { error: finalErr } = await signUp.finalize();
    if (finalErr) {
      setGlobalError(finalErr.message ?? "Verification failed. Please try again.");
      setLoading(false);
      return;
    }

    if (signUp.status === "complete") {
      clearOtpLock();
      await fetch("/api/auth/sync", { method: "POST" });
      router.push(redirectTo || "/workspace-setup");
    }

    setLoading(false);
  }

  async function handleGoogle() {
    if (fetchStatus === "fetching" || !signUp) return;
    try {
      const { error } = await signUp.sso({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectCallbackUrl: redirectTo || "/workspace-setup",
      });
      if (error) setGlobalError(error.message ?? "Google sign-up failed.");
    } catch (err: unknown) {
      // Clerk throws internally for CAPTCHA in dev — redirect still proceeds, ignore
      const clerkErr = err as { errors?: { message: string }[] };
      if (clerkErr?.errors?.[0]?.message) setGlobalError(clerkErr.errors[0].message);
    }
  }

  async function resendOtp() {
    if (fetchStatus === "fetching" || resendCooldown > 0 || !signUp) return;
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      setGlobalError(error.message ?? "Failed to resend code.");
      return;
    }
    setResendCooldown(RESEND_COOLDOWN_S);
    setOtpCode("");
    saveOtpLock({ attempts: 0, lockedUntil: null });
    setOtpAttempts(0);
    setGlobalError("");
  }

  return (
    <div className="flex min-h-screen">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] sticky top-0 h-screen bg-primary flex-col p-12 relative overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[340px] h-[340px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-[260px] h-[260px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)" }} />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">DEAL<span className="text-secondary">FLOW</span></span>
        </Link>

        <div className="relative z-10 flex-1 flex items-center justify-center py-6">
          <Image src={signupSvg} alt="Sign up illustration" width={340} height={260} unoptimized className="w-full max-w-xs opacity-90" />
        </div>

        <div className="relative z-10 flex-shrink-0 space-y-5">
          <div className="space-y-2">
            <h2 className="font-display font-bold text-white leading-tight" style={{ fontSize: "clamp(1.6rem, 2.2vw, 2.2rem)" }}>
              Start closing more <span className="text-secondary">deals.</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">Join 500+ teams managing leads, clients, and revenue in one place.</p>
          </div>
          <div className="space-y-2.5">
            {["Full pipeline & lead tracking", "Client & order management", "Revenue & analytics dashboard", "Team workspace with roles"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-secondary" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-white/60 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs">© 2026 Dealflow. All rights reserved.</p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">

          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-primary">DEAL<span className="text-secondary">FLOW</span></span>
          </Link>

          {globalError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-tertiary/10 border border-tertiary/25 text-tertiary text-sm font-medium">
              {globalError}
            </div>
          )}

          {/* ── STEP 1: Account type ── */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <h1 className="font-display font-bold text-primary text-3xl">Create account</h1>
                <p className="text-neutral text-sm mt-2">First, tell us how you work.</p>
              </div>
              <div className="space-y-4">
                {[
                  {
                    type: "business" as AccountType,
                    title: "Business / Agency",
                    desc: "Managing multiple clients, team members, and large pipelines.",
                    tags: ["Team workspace", "Client management", "Revenue tracking"],
                    icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>,
                  },
                  {
                    type: "freelancer" as AccountType,
                    title: "Individual / Freelancer",
                    desc: "Solo professional tracking leads, proposals, and client projects.",
                    tags: ["Lead tracking", "Reminders", "Simple pipeline"],
                    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
                  },
                ].map((card) => (
                  <button
                    key={card.type}
                    onClick={() => { setAccountType(card.type); setStep(2); }}
                    className="w-full text-left p-5 rounded-2xl border-2 border-neutral/15 hover:border-secondary hover:bg-secondary/5 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)", transform: "scale(2)" }} />
                        <div className="relative w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-secondary" style={{ boxShadow: "0 0 20px rgba(74,222,128,0.2)" }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{card.icon}</svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-bold text-primary text-base group-hover:text-secondary transition-colors">{card.title}</p>
                        <p className="text-neutral text-sm mt-1 leading-relaxed">{card.desc}</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {card.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold">{t}</span>)}
                        </div>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-neutral group-hover:text-secondary transition-colors flex-shrink-0 mt-1" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-neutral mt-8">
                Already have an account?{" "}
                <Link href="/login" className="text-secondary font-semibold hover:text-secondary/80 transition-colors">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: Details form ── */}
          {step === 2 && (
            <div>
              {!isInviteFlow && (
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-neutral hover:text-primary transition-colors mb-6">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  Back
                </button>
              )}

              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-secondary/10 border border-secondary/25 text-secondary">
                  {isInviteFlow ? "Joining via invite" : accountType === "business" ? "Business / Agency" : "Individual / Freelancer"}
                </span>
              </div>

              <div className="mb-7">
                <h1 className="font-display font-bold text-primary text-3xl">
                  {isInviteFlow ? "Create your account" : "Your details"}
                </h1>
                <p className="text-neutral text-sm mt-1.5">
                  {isInviteFlow ? "Set up your account to join the workspace." : "Get started free — no credit card required."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Muneeb Ahmed" className={fieldClass(!!errors.name)} />
                  {errors.name && <p className="text-xs text-tertiary">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={fieldClass(!!errors.email)} />
                  {errors.email && <p className="text-xs text-tertiary">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className={fieldClass(!!errors.password) + " pr-11"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral hover:text-primary transition-colors">
                      {showPassword
                        ? <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor[passwordStrength] : "bg-neutral/15"}`} />
                        ))}
                      </div>
                      <span className={`text-[11px] font-semibold ${passwordStrength <= 2 ? "text-tertiary" : "text-secondary"}`}>{strengthLabel[passwordStrength]}</span>
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-tertiary">{errors.password}</p>}
                </div>

                {accountType === "business" && (
                  <div className="space-y-4 pt-3 border-t border-neutral/10">
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wider">Business Details</p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary uppercase tracking-wider">Agency / Business Name</label>
                      <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="NexGen Agency" className={fieldClass(!!errors.businessName)} />
                      {errors.businessName && <p className="text-xs text-tertiary">{errors.businessName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary uppercase tracking-wider">Business Email</label>
                      <input type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="hello@youragency.com" className={fieldClass(!!errors.businessEmail)} />
                      {errors.businessEmail && <p className="text-xs text-tertiary">{errors.businessEmail}</p>}
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-3 border-t border-neutral/10">
                  <p className="text-xs font-semibold text-neutral uppercase tracking-wider">Contact & Capacity</p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-primary uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral text-sm">+</span>
                      <input type="tel" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} placeholder="92 300 1234567" className={fieldClass(!!errors.businessPhone) + " pl-7"} />
                    </div>
                    {errors.businessPhone && <p className="text-xs text-tertiary">{errors.businessPhone}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-primary uppercase tracking-wider">Estimated Clients on Board</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {clientRanges.map(range => (
                        <button key={range} type="button" onClick={() => setEstimatedClients(range)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all duration-150 ${estimatedClients === range ? "border-secondary bg-secondary/10 text-secondary" : "border-neutral/20 text-neutral hover:border-secondary/50 hover:text-primary"}`}>
                          {range}
                        </button>
                      ))}
                    </div>
                    {errors.estimatedClients && <p className="text-xs text-tertiary">{errors.estimatedClients}</p>}
                  </div>
                </div>

                <p className="text-xs text-neutral leading-relaxed pt-1">
                  By creating an account you agree to our{" "}
                  <Link href="/terms" className="text-primary font-medium hover:text-secondary transition-colors">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary font-medium hover:text-secondary transition-colors">Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Creating account..." : "Create my account"}
                </button>

                {accountType === "freelancer" && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-neutral/15" />
                      <span className="text-neutral text-xs">or continue with</span>
                      <div className="flex-1 h-px bg-neutral/15" />
                    </div>
                    <button type="button" onClick={handleGoogle}
                      className="w-full py-3 border border-neutral/20 rounded-xl flex items-center justify-center gap-2.5 text-sm font-medium text-primary hover:bg-neutral-light transition-colors">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </button>
                  </>
                )}
              </form>

              <p className="text-center text-sm text-neutral mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-secondary font-semibold hover:text-secondary/80 transition-colors">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 3: OTP verification ── */}
          {step === 3 && (
            <div>
              <div className="mb-8 text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${lockedUntil ? "bg-tertiary/10 border border-tertiary/25" : "bg-secondary/10 border border-secondary/25"}`}>
                  {lockedUntil ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-tertiary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                  )}
                </div>
                <h1 className="font-display font-bold text-primary text-2xl">
                  {lockedUntil ? "Account locked" : "Check your email"}
                </h1>
                <p className="text-neutral text-sm mt-2 leading-relaxed">
                  {lockedUntil
                    ? <>Too many wrong attempts. Try again in <span className="text-tertiary font-semibold">{Math.floor(lockCountdown / 60)}:{String(lockCountdown % 60).padStart(2, "0")}</span></>
                    : <>We sent a 6-digit code to <span className="text-primary font-semibold">{email}</span></>
                  }
                </p>
                {!lockedUntil && otpAttempts > 0 && (
                  <p className="text-tertiary text-xs mt-1 font-medium">
                    {MAX_ATTEMPTS - otpAttempts} attempt{MAX_ATTEMPTS - otpAttempts === 1 ? "" : "s"} remaining before 1-hour lock
                  </p>
                )}
              </div>

              {!lockedUntil && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-primary uppercase tracking-wider">Verification Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full px-4 py-3.5 rounded-xl border border-neutral/20 bg-neutral-light text-primary text-xl font-bold text-center tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal placeholder:text-neutral/30 placeholder:text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all"
                    />
                  </div>

                  <button type="submit" disabled={loading || otpCode.length < 6}
                    className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                {lockedUntil ? (
                  <p className="text-xs text-neutral">Account will unlock automatically after the timer expires.</p>
                ) : (
                  <p className="text-sm text-neutral">
                    Didn&apos;t receive it?{" "}
                    <button
                      onClick={resendOtp}
                      disabled={resendCooldown > 0}
                      className="text-secondary font-semibold hover:text-secondary/80 transition-colors disabled:text-neutral disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterContent />
    </Suspense>
  );
}
