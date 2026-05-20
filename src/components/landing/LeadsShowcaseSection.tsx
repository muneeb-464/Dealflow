"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const bullets = [
  "Kanban + table view — switch anytime",
  "48hr auto follow-up alerts via email",
  "Track by platform — Upwork, Fiverr, LinkedIn, Direct",
  "Lost reason tracking — know why deals fall through",
];

const leads = [
  { name: "Ahmad Khan",  platform: "Upwork",   platformColor: "bg-green-900/50 text-green-400",  amount: "$1,200", status: "Pending",    statusColor: "bg-yellow-500/20 text-yellow-400" },
  { name: "Sara Ltd",    platform: "LinkedIn", platformColor: "bg-blue-900/50 text-blue-400",    amount: "$3,500", status: "Replied",    statusColor: "bg-secondary/20 text-secondary" },
  { name: "TechStart",   platform: "Direct",   platformColor: "bg-white/10 text-white/50",       amount: "$800",   status: "Follow-up",  statusColor: "bg-tertiary/20 text-tertiary" },
];

export default function LeadsShowcaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef   = useRef<HTMLDivElement>(null);
  const rightRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none none" },
        }
      );
      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1, x: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none none" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-neutral-light py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div ref={leftRef} className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold">
              <span className="text-secondary">⚡</span>
              Lead Tracking
            </div>

            <h2 className="font-display font-bold text-primary leading-tight text-4xl lg:text-5xl">
              Never lose a<br />
              <span className="text-secondary underline decoration-secondary/40 underline-offset-4">lead</span> again
            </h2>

            <p className="text-neutral text-base lg:text-lg leading-relaxed">
              Every outreach tracked. Every follow-up flagged.
              Every conversion recorded. Your pipeline, finally under control.
            </p>

            <ul className="space-y-4 pt-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">✦</div>
                  <span className="text-primary text-sm font-medium">{b}</span>
                </li>
              ))}
            </ul>

            <button className="group mt-2 inline-flex items-center gap-2 bg-primary text-secondary font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-xl hover:shadow-secondary/30 hover:scale-105 active:scale-100">
              Start Tracking Leads
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Right — UI mockup */}
          <div ref={rightRef}>
            <div className="bg-primary rounded-2xl p-5 shadow-2xl shadow-primary/30">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-bold text-white text-sm">Lead Pipeline</p>
                <button className="bg-secondary/15 text-secondary text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-lg hover:shadow-secondary/25 hover:scale-105 active:scale-100">
                  + Add Lead
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{ n: "48", l: "Sent" }, { n: "23", l: "Replied" }, { n: "12", l: "Converted" }].map((s) => (
                  <div key={s.l} className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="font-display font-bold text-secondary text-xl">{s.n}</p>
                    <p className="text-white/40 text-[10px] mt-1">{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Lead rows */}
              <div className="space-y-2.5 mb-4">
                {leads.map((lead) => (
                  <div key={lead.name} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                      <span className="text-white text-xs font-medium">{lead.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${lead.platformColor}`}>
                        {lead.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs font-semibold">{lead.amount}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${lead.statusColor}`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert banner */}
              <div className="flex items-center justify-between bg-tertiary/15 border border-tertiary/25 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-tertiary flex-shrink-0" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
                  </svg>
                  <span className="text-white/80 text-xs">3 leads need follow-up today</span>
                </div>
                <button className="text-tertiary text-xs font-semibold hover:opacity-80 transition-opacity">View all →</button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
