"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        <circle cx="7" cy="6" r="1" fill="currentColor" />
        <circle cx="7" cy="12" r="1" fill="currentColor" />
        <circle cx="7" cy="18" r="1" fill="currentColor" />
      </svg>
    ),
    title: "Leads Tracker",
    desc: "Track every lead from first contact to closed deal. Kanban + table view.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Client Management",
    desc: "Full client profiles, order history, notes, and tags in one place.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
      </svg>
    ),
    title: "Auto Reminders",
    desc: "48hr no-reply? We flag it. Email alerts so you never miss a follow-up.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Revenue Tracking",
    desc: "Multi-currency revenue with live exchange rates. PKR, USD, AED and more.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
        <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
        <line x1="2" y1="20" x2="22" y2="20" strokeLinecap="round" />
      </svg>
    ),
    title: "Analytics",
    desc: "Conversion rates, best platforms, team performance. Know what's working.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
        <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
      </svg>
    ),
    title: "Team Workspace",
    desc: "Invite your team. Assign leads. Role-based access for Owner, Manager, Employee.",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        cardsRef.current!.children,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative bg-primary py-20 lg:py-28 overflow-hidden">

      {/* Bottom-left decorative rings */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full border border-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full border border-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-14 left-16 w-10 h-10 rounded-full bg-secondary/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* Header — centered */}
        <div ref={headingRef} className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-secondary text-xs px-3.5 py-1.5 rounded-full font-semibold">
            <span className="text-secondary">✦</span>
            Everything You Need
          </div>

          <h2 className="font-display font-bold text-white leading-tight text-4xl lg:text-6xl mt-5">
            One platform.<br />
            All your <span className="text-secondary">deals.</span>
          </h2>

          <p className="text-white/60 text-lg lg:text-xl leading-relaxed mt-5">
            From first lead to final payment — Dealflow keeps
            your entire business pipeline in one place.
          </p>
        </div>

        {/* Feature cards */}
        <div ref={cardsRef} className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-8 border border-neutral/10 shadow-sm hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-default"
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 20px 60px -8px rgba(74,222,128,0.35)";
                e.currentTarget.style.borderColor = "rgba(74,222,128,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              {/* Watermark number */}
              <span className="absolute top-4 right-5 font-display font-bold text-6xl text-neutral/8 select-none leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Green top accent bar */}
              <div className="w-10 h-1 bg-secondary rounded-full mb-6" />

              {/* Icon */}
              <div className="relative w-11 h-11 mb-5">
                <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.2) 0%, transparent 70%)", transform: "scale(2.2)" }} />
                <div className="relative w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-secondary" style={{ boxShadow: "0 0 20px rgba(74,222,128,0.2)" }}>
                  {feature.icon}
                </div>
              </div>

              <p className="font-display font-bold text-primary text-base mb-2">{feature.title}</p>
              <p className="text-neutral text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
