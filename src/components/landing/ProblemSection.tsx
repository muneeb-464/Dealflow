"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const painPoints = [
  {
    number: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
    title: "Leads Fall Through Cracks",
    desc: "You send a proposal and forget to follow up. The client moves on.",
  },
  {
    number: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
        <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
      </svg>
    ),
    title: "Missed Follow-Ups",
    desc: "No reminder system. You remember on day 5, but the moment has passed.",
  },
  {
    number: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
        <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
        <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
        <line x1="2" y1="20" x2="22" y2="20" strokeLinecap="round" />
        <path d="M3 6l4-3 5 4 5-5 4 3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" />
      </svg>
    ),
    title: "No Revenue Visibility",
    desc: "You have no idea which platform or client is actually making you money.",
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
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

      // Cards stagger animation
      gsap.fromTo(
        cardsRef.current!.children,
        { opacity: 0, y: 70, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.2,
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
    <section ref={sectionRef} className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 text-center">

        {/* Label */}
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
          The Problem
        </div>

        {/* Headline */}
        <h2 ref={headingRef} className="font-display font-bold text-primary leading-tight text-4xl lg:text-6xl mt-5">
          Managing clients shouldn&apos;t<br />
          feel like <span className="text-secondary">chaos</span>
        </h2>

        {/* Subtext */}
        <p className="text-neutral text-lg lg:text-xl leading-relaxed mt-5 max-w-2xl mx-auto">
          Freelancers and agency owners lose deals every week — not because of bad work,
          but because of scattered tools, missed follow-ups, and zero visibility into their pipeline.
        </p>

        {/* Pain point cards */}
        <div ref={cardsRef} className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-16 text-left">
          {painPoints.map((card) => (
            <div
              key={card.title}
              className="group relative bg-white border border-neutral/10 rounded-2xl p-8 shadow-sm hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-default"
              style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease" }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 20px 60px -8px rgba(74,222,128,0.35)";
                e.currentTarget.style.borderColor = "rgba(74,222,128,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              {/* Faint number watermark */}
              <span className="absolute top-4 right-5 font-display font-bold text-6xl text-neutral/8 select-none leading-none">
                {card.number}
              </span>

              {/* Green top accent bar */}
              <div className="w-10 h-1 bg-secondary rounded-full mb-6" />

              {/* Icon */}
              <div className="relative w-12 h-12 mb-5">
                <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)", transform: "scale(2.2)" }} />
                <div className="relative w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-secondary transition-all duration-300 group-hover:bg-secondary group-hover:text-primary" style={{ boxShadow: "0 0 20px rgba(74,222,128,0.2)" }}>
                  {card.icon}
                </div>
              </div>

              <p className="font-display font-bold text-primary text-lg mb-3">{card.title}</p>
              <p className="text-neutral text-base leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
