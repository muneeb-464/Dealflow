"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import img1 from "@/components/assets/munib.jpeg";

const values = [
  {
    title: "Built for freelancers",
    desc: "We are freelancers. Every feature solves a real problem we faced ourselves — not hypothetical ones.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: "Simple over complex",
    desc: "If it needs a manual, we haven't done our job. Clarity wins every single time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 12l2.5 2.5L16 9" />
      </svg>
    ),
  },
  {
    title: "Ownership mindset",
    desc: "We treat your data and business like our own — secure, private, and entirely yours.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

const stats = [
  { num: "500+", label: "Freelancers & agencies" },
  { num: "12k+", label: "Leads tracked" },
  { num: "98%", label: "Satisfaction rate" },
  { num: "4.8", label: "Average rating" },
];

export default function AboutPage() {
  return (
    <main className="font-sans bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-primary relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(74,222,128,0.12) 0%, transparent 60%)" }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full border border-white/5 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[380px] h-[380px] rounded-full border border-white/5 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-12 h-12 rounded-full bg-secondary/10 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-secondary text-xs px-3.5 py-1.5 rounded-full font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Our Story
              </div>
              <h1 className="font-display font-bold text-white leading-[1.08] mb-6" style={{ fontSize: "clamp(2.4rem, 4vw, 3.6rem)" }}>
                We built the CRM<br />we <span className="text-secondary">always</span> wished<br />existed
              </h1>
              <p className="text-white/55 text-base leading-relaxed max-w-md mb-8">
                Dealflow started as a personal tool to stop losing track of client conversations, proposals, and follow-ups. Now it helps hundreds of freelancers and agencies do the same.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/dashboard" className="group inline-flex items-center gap-2 bg-secondary text-primary px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-secondary/30 transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-xl hover:scale-105 active:scale-100">
                  Get Started Free
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a href="/contact" className="group inline-flex items-center gap-2 text-white/60 text-sm font-medium transition-all duration-300 hover:text-secondary px-2">
                  Talk to us →
                </a>
              </div>
            </div>

            {/* Right — floating cards */}
            <div className="hidden lg:flex flex-col gap-4 items-end">
              <div className="w-64 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-white/40 text-xs mb-1">Founded</p>
                <p className="font-display font-bold text-white text-lg">2024 · Remote-first</p>
                <div className="mt-3 w-full h-px bg-white/10" />
                <p className="text-white/40 text-xs mt-3">Mission</p>
                <p className="text-white/70 text-sm mt-1 leading-snug">One platform for every freelancer's pipeline</p>
              </div>
              <div className="w-52 bg-secondary/10 border border-secondary/20 rounded-2xl p-5">
                <p className="text-secondary text-xs font-semibold mb-1">Team size</p>
                <p className="font-display font-bold text-white text-2xl">12</p>
                <p className="text-white/40 text-xs mt-1">across 4 countries</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section className="bg-primary border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
            {stats.map((s) => (
              <div key={s.label} className="py-10 px-8 text-center">
                <p className="font-display font-bold text-secondary text-4xl lg:text-5xl mb-1">{s.num}</p>
                <p className="text-white/40 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Origin story ── */}
      <section className="bg-white px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold mb-6">
              <span className="text-secondary">✦</span> Why we built this
            </div>
            <h2 className="font-display font-bold text-primary text-4xl leading-tight mb-6">
              From spreadsheet<br />chaos to clarity
            </h2>
            <p className="text-neutral leading-relaxed mb-5">
              Before Dealflow, our founder was managing 30+ active leads across Google Sheets, sticky notes, and a cluttered inbox. A follow-up would get missed. A client would go cold. A deal would slip through.
            </p>
            <p className="text-neutral leading-relaxed">
              The tools that existed were either built for enterprise sales teams (too complex) or generic task managers (too basic). Nothing was designed for the reality of freelance client work. So we built it.
            </p>
          </div>

          {/* Quote card */}
          <div
            className="bg-primary rounded-3xl p-8 lg:p-10 relative overflow-hidden cursor-default transition-all duration-300"
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 32px 80px -12px rgba(74,222,128,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-secondary/30 mb-6">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-white/80 text-lg leading-relaxed font-display mb-6">
              "I lost a $4,000 project because I forgot to follow up. That was the day I decided to build Dealflow."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-secondary/30">
                <Image src={img1} alt="Muneeb Sajjad" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm">Muneeb Sajjad</p>
                <p className="text-secondary text-xs">Founder & CEO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-neutral-light px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold mb-4">
              <span className="text-secondary">✦</span> Our Values
            </div>
            <h2 className="font-display font-bold text-primary text-4xl">What we stand for</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-8 border border-neutral/10 relative overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-2"
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 20px 60px -8px rgba(74,222,128,0.3)";
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.4)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "";
                }}
              >
                <span className="absolute top-5 right-5 font-display font-bold text-5xl text-neutral/6 select-none leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-secondary mb-6" style={{ boxShadow: "0 0 20px rgba(74,222,128,0.2)" }}>
                  {v.icon}
                </div>
                <p className="font-display font-bold text-primary text-base mb-3">{v.title}</p>
                <p className="text-neutral text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-white px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold mb-4">
              <span className="text-secondary">✦</span> The Team
            </div>
            <h2 className="font-display font-bold text-primary text-4xl">People behind Dealflow</h2>
            <p className="text-neutral mt-3 max-w-md mx-auto text-sm">Built by a freelancer, for freelancers.</p>
          </div>

          {/* Single founder — featured card */}
          <div className="max-w-3xl mx-auto">
            <div
              className="group bg-neutral-light rounded-3xl overflow-hidden border border-neutral/10 cursor-default transition-all duration-300 hover:-translate-y-1 grid grid-cols-1 md:grid-cols-2"
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 24px 64px -8px rgba(74,222,128,0.3)";
                e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              {/* Photo */}
              <div className="relative h-72 md:h-auto bg-primary overflow-hidden">
                <Image src={img1} alt="Muneeb Sajjad" fill className="object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span className="text-secondary text-xs font-bold bg-secondary/20 border border-secondary/30 px-3 py-1.5 rounded-full">Founder & CEO</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-8 flex flex-col justify-center gap-5">
                <div>
                  <p className="font-display font-bold text-primary text-2xl mb-1">Muneeb Sajjad</p>
                  <p className="text-secondary text-sm font-semibold">Founder & CEO</p>
                </div>
                <p className="text-neutral text-sm leading-relaxed">
                  Freelancer turned SaaS founder. Built Dealflow to fix the chaos of managing clients across 5 spreadsheets — a problem every freelancer knows too well.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    "5+ years freelancing experience",
                    "Built Dealflow from scratch",
                    "Remote-first, customer-obsessed",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-secondary" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-primary text-xs font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="/contact" className="inline-flex items-center gap-2 text-secondary text-sm font-semibold hover:underline w-fit">
                  Say hello →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary px-6 lg:px-12 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(74,222,128,0.1) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-white text-4xl lg:text-5xl mb-4">
            Ready to take control<br />of your <span className="text-secondary">pipeline?</span>
          </h2>
          <p className="text-white/50 text-base mb-8">Join 500+ freelancers and agencies who use Dealflow to close more deals.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/dashboard" className="group inline-flex items-center gap-2 bg-secondary text-primary px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-secondary/30 transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 active:scale-100">
              Start for Free
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a href="/pricing" className="inline-flex items-center gap-2 text-white/60 text-sm font-medium hover:text-secondary transition-colors px-2">
              View Pricing →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
