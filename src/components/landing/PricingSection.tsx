"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const freeFeatures = [
  { text: "Up to 50 leads/month",   included: true },
  { text: "1 workspace",            included: true },
  { text: "Client management",      included: true },
  { text: "Email reminders",        included: true },
  { text: "Team members",           included: false },
  { text: "Analytics",              included: false },
  { text: "Revenue tracking",       included: false },
];

const proFeatures = [
  { text: "Unlimited leads",                included: true },
  { text: "Multiple workspaces",            included: true },
  { text: "Client management",              included: true },
  { text: "Email reminders",               included: true },
  { text: "Up to 10 team members",         included: true },
  { text: "Full analytics",                included: true },
  { text: "Revenue tracking + export",     included: true },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current!.children,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8, ease: "power3.out", stagger: 0.2,
          scrollTrigger: { trigger: cardsRef.current, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const proPrice = yearly ? 15 : 19;

  return (
    <section ref={sectionRef} className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 text-center">

        {/* Label */}
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold">
          <span>💳</span> Pricing
        </div>

        {/* Headline */}
        <h2 className="font-display font-bold text-primary leading-tight text-4xl lg:text-6xl mt-5">
          Simple, <span className="text-secondary">transparent</span><br />pricing
        </h2>

        {/* Toggle */}
        <div className="flex items-center justify-center mt-8">
          <div className="relative flex items-center bg-primary/5 border border-primary/10 rounded-full p-1.5 gap-1">

            <button
              onClick={() => setYearly(false)}
              className={`relative z-10 px-7 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                !yearly
                  ? "bg-primary text-secondary shadow-lg shadow-primary/20"
                  : "text-neutral hover:text-primary"
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setYearly(true)}
              className={`relative z-10 flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                yearly
                  ? "bg-primary text-secondary shadow-lg shadow-primary/20"
                  : "text-neutral hover:text-primary"
              }`}
            >
              Yearly
              <span className="text-[11px] font-bold text-secondary bg-secondary/20 px-2 py-0.5 rounded-full leading-tight">
                -20%
              </span>
            </button>

          </div>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">

          {/* Free plan */}
          <div className="group bg-neutral-light border border-neutral/10 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 20px 60px -8px rgba(74,222,128,0.2)"; e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
          >
            <p className="font-display font-bold text-primary text-2xl">Free</p>
            <p className="text-neutral text-sm mt-1">For solo freelancers</p>

            <div className="flex items-end gap-1 mt-6">
              <span className="font-display font-bold text-primary text-5xl">$0</span>
              <span className="text-neutral text-sm mb-2">/month</span>
            </div>

            <ul className="mt-6 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  {f.included
                    ? <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary flex-shrink-0" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-neutral/40 flex-shrink-0" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" /></svg>
                  }
                  <span className={`text-sm ${f.included ? "text-primary" : "text-neutral/40"}`}>{f.text}</span>
                </li>
              ))}
            </ul>

            <Link href="/dashboard" className="group/btn mt-8 w-full py-3.5 bg-primary text-secondary font-semibold rounded-full transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-lg hover:shadow-secondary/25 hover:scale-[1.02] active:scale-100 block text-center">
              Get Started Free
            </Link>
          </div>

          {/* Pro plan */}
          <div className="relative bg-primary border-2 border-secondary rounded-2xl p-8 shadow-2xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 24px 64px -8px rgba(74,222,128,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}
          >
            {/* Badge */}
            <span className="absolute top-5 right-5 bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </span>

            <p className="font-display font-bold text-white text-2xl">Pro</p>
            <p className="text-white/50 text-sm mt-1">For agencies & teams</p>

            <div className="flex items-end gap-1 mt-6">
              <span className="font-display font-bold text-secondary text-5xl">${proPrice}</span>
              <span className="text-white/40 text-sm mb-2">/month</span>
            </div>

            <ul className="mt-6 space-y-3">
              {proFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary flex-shrink-0" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-white/80 text-sm">{f.text}</span>
                </li>
              ))}
            </ul>

            <Link href="/dashboard" className="group/btn mt-8 w-full py-3.5 bg-secondary text-primary font-bold rounded-full transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-xl hover:shadow-secondary/30 hover:scale-[1.02] active:scale-100 block text-center">
              Start Pro Trial
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
