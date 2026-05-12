"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import signupSvg from "../../assets/signup.svg";

type AccountType = "business" | "freelancer" | null;

const clientRanges = ["1–5 clients", "6–20 clients", "21–50 clients", "51–100 clients", "100+ clients"];

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Business-only fields
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [estimatedClients, setEstimatedClients] = useState("");

  // Field-level errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : password.length < 14 ? 3
    : 4;

  const strengthColor = ["bg-neutral/15", "bg-tertiary", "bg-tertiary", "bg-secondary", "bg-secondary"];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];

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
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) errs.businessEmail = "Enter a valid business email.";
    }
    if (!businessPhone.trim()) errs.businessPhone = "Phone number is required.";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(businessPhone)) errs.businessPhone = "Enter a valid phone number.";
    if (!estimatedClients) errs.estimatedClients = "Please select an estimate.";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateStep2();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // submit
    }
  }

  function handleTypeSelect(type: AccountType) {
    setAccountType(type);
    setStep(2);
  }

  function fieldClass(hasError: boolean) {
    return `w-full px-4 py-3 rounded-xl border text-primary text-sm placeholder:text-neutral/50 focus:outline-none focus:ring-2 transition-all bg-neutral-light ${
      hasError ? "border-tertiary focus:border-tertiary focus:ring-tertiary/15" : "border-neutral/20 focus:border-secondary focus:ring-secondary/15"
    }`;
  }

  return (
    <div className="flex min-h-screen">

      {/* Left — sticky branding panel */}
      <div className="hidden lg:flex lg:w-[45%] sticky top-0 h-screen bg-primary flex-col p-12 relative overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[340px] h-[340px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-[260px] h-[260px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)" }} />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">DEAL<span className="text-secondary">FLOW</span></span>
        </Link>

        {/* Illustration */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-6">
          <Image src={signupSvg} alt="Sign up illustration" width={340} height={260} unoptimized className="w-full max-w-xs opacity-90" />
        </div>

        {/* Text + checklist */}
        <div className="relative z-10 flex-shrink-0 space-y-5">
          <div className="space-y-2">
            <h2 className="font-display font-bold text-white leading-tight" style={{ fontSize: "clamp(1.6rem, 2.2vw, 2.2rem)" }}>
              Start closing more <span className="text-secondary">deals.</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Join 500+ teams managing leads, clients, and revenue in one place.
            </p>
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

      {/* Right — scrollable form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-primary">DEAL<span className="text-secondary">FLOW</span></span>
          </Link>

          {/* ── STEP 1: Account type selection ── */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <h1 className="font-display font-bold text-primary text-3xl">Create account</h1>
                <p className="text-neutral text-sm mt-2">First, tell us how you work.</p>
              </div>

              <div className="space-y-4">
                {/* Business card */}
                <button
                  onClick={() => handleTypeSelect("business")}
                  className="w-full text-left p-5 rounded-2xl border-2 border-neutral/15 hover:border-secondary hover:bg-secondary/5 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)", transform: "scale(2)" }} />
                      <div className="relative w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-secondary" style={{ boxShadow: "0 0 20px rgba(74,222,128,0.2)" }}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-primary text-base group-hover:text-secondary transition-colors">Business / Agency</p>
                      <p className="text-neutral text-sm mt-1 leading-relaxed">Managing multiple clients, team members, and large pipelines.</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {["Team workspace", "Client management", "Revenue tracking"].map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold">{t}</span>
                        ))}
                      </div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-neutral group-hover:text-secondary transition-colors flex-shrink-0 mt-1" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>

                {/* Freelancer card */}
                <button
                  onClick={() => handleTypeSelect("freelancer")}
                  className="w-full text-left p-5 rounded-2xl border-2 border-neutral/15 hover:border-secondary hover:bg-secondary/5 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <div className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)", transform: "scale(2)" }} />
                      <div className="relative w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-secondary" style={{ boxShadow: "0 0 20px rgba(74,222,128,0.2)" }}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-primary text-base group-hover:text-secondary transition-colors">Individual / Freelancer</p>
                      <p className="text-neutral text-sm mt-1 leading-relaxed">Solo professional tracking leads, proposals, and client projects.</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {["Lead tracking", "Reminders", "Simple pipeline"].map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold">{t}</span>
                        ))}
                      </div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-neutral group-hover:text-secondary transition-colors flex-shrink-0 mt-1" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              </div>

              <p className="text-center text-sm text-neutral mt-8">
                Already have an account?{" "}
                <Link href="/login" className="text-secondary font-semibold hover:text-secondary/80 transition-colors">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: Fill in details ── */}
          {step === 2 && (
            <div>
              {/* Back + header */}
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-neutral hover:text-primary transition-colors mb-6">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>

              {/* Account type badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-secondary/10 border border-secondary/25 text-secondary">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    {accountType === "business"
                      ? <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>
                      : <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>
                    }
                  </svg>
                  {accountType === "business" ? "Business / Agency" : "Individual / Freelancer"}
                </span>
              </div>

              <div className="mb-7">
                <h1 className="font-display font-bold text-primary text-3xl">Your details</h1>
                <p className="text-neutral text-sm mt-1.5">Get started free — no credit card required.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Muneeb Ahmed" className={fieldClass(!!errors.name)} />
                  {errors.name && <p className="text-xs text-tertiary">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={fieldClass(!!errors.email)} />
                  {errors.email && <p className="text-xs text-tertiary">{errors.email}</p>}
                </div>

                {/* Password */}
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

                {/* ── Business-only fields ── */}
                {accountType === "business" && (
                  <div className="space-y-4 pt-3 border-t border-neutral/10">
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wider">Business Details</p>

                    {/* Business name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary uppercase tracking-wider">Agency / Business Name</label>
                      <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="NexGen Agency" className={fieldClass(!!errors.businessName)} />
                      {errors.businessName && <p className="text-xs text-tertiary">{errors.businessName}</p>}
                    </div>

                    {/* Business email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary uppercase tracking-wider">Business Email</label>
                      <input type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="hello@youragency.com" className={fieldClass(!!errors.businessEmail)} />
                      {errors.businessEmail && <p className="text-xs text-tertiary">{errors.businessEmail}</p>}
                    </div>
                  </div>
                )}

                {/* ── Shared fields (both types) ── */}
                <div className="space-y-4 pt-3 border-t border-neutral/10">
                  <p className="text-xs font-semibold text-neutral uppercase tracking-wider">Contact & Capacity</p>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-primary uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral text-sm">+</span>
                      <input
                        type="tel"
                        value={businessPhone}
                        onChange={e => setBusinessPhone(e.target.value)}
                        placeholder="92 300 1234567"
                        className={fieldClass(!!errors.businessPhone) + " pl-7"}
                      />
                    </div>
                    {errors.businessPhone && <p className="text-xs text-tertiary">{errors.businessPhone}</p>}
                  </div>

                  {/* Estimated clients */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-primary uppercase tracking-wider">Estimated Clients on Board</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {clientRanges.map(range => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setEstimatedClients(range)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                            estimatedClients === range
                              ? "border-secondary bg-secondary/10 text-secondary"
                              : "border-neutral/20 text-neutral hover:border-secondary/50 hover:text-primary"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                    {errors.estimatedClients && <p className="text-xs text-tertiary">{errors.estimatedClients}</p>}
                  </div>
                </div>

                {/* Terms */}
                <p className="text-xs text-neutral leading-relaxed pt-1">
                  By creating an account you agree to our{" "}
                  <a href="#" className="text-primary font-medium hover:text-secondary transition-colors">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary font-medium hover:text-secondary transition-colors">Privacy Policy</a>.
                </p>

                {/* Submit */}
                <button type="submit" className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  Create my account
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-neutral/15" />
                  <span className="text-neutral text-xs">or continue with</span>
                  <div className="flex-1 h-px bg-neutral/15" />
                </div>

                {/* Google SSO */}
                <button type="button" className="w-full py-3 border border-neutral/20 rounded-xl flex items-center justify-center gap-2.5 text-sm font-medium text-primary hover:bg-neutral-light transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </form>

              <p className="text-center text-sm text-neutral mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-secondary font-semibold hover:text-secondary/80 transition-colors">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
