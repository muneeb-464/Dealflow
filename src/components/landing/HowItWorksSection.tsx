"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
      </svg>
    ),
    title: "Add Your Leads",
    desc: "Log every outreach — platform, contact, proposed amount. Takes 30 seconds.",
  },
  {
    number: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={2}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Track & Follow Up",
    desc: "Watch leads move through your pipeline. Get auto-alerts if no reply in 48 hours.",
  },
  {
    number: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={2}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Convert & Grow",
    desc: "One click to convert a lead into a client. Watch your revenue grow in real-time.",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 88%", toggleActions: "play none none none" },
        }
      );

      gsap.fromTo(
        stepsRef.current!.children,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.75, ease: "power3.out", stagger: 0.2,
          scrollTrigger: { trigger: stepsRef.current, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div ref={headingRef} className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold">
            <span className="text-secondary font-bold">→</span>
            How It Works
          </div>

          <h2 className="font-display font-bold text-primary leading-tight text-4xl lg:text-6xl mt-5">
            Up and running<br />
            in <span className="text-secondary">minutes</span>
          </h2>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="mt-16 flex flex-col lg:flex-row items-stretch gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="flex lg:flex-col flex-row flex-1">

              {/* Step content */}
              <div
                className="group flex-1 flex flex-col lg:items-center lg:text-center items-start text-left px-6 lg:px-10 py-8 lg:py-10 relative rounded-2xl border border-transparent transition-all duration-300 hover:-translate-y-1"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.4)";
                  e.currentTarget.style.boxShadow = "0 16px 48px -8px rgba(74,222,128,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.boxShadow = "";
                }}
              >

                {/* Faint big number */}
                <span className="absolute top-6 right-6 lg:top-4 lg:right-auto font-display font-bold text-8xl text-secondary/8 select-none leading-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative w-16 h-16 mb-6 flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)", transform: "scale(2.2)" }} />
                  <div className="relative w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-secondary" style={{ boxShadow: "0 0 28px rgba(74,222,128,0.22)" }}>
                    {step.icon}
                  </div>
                </div>

                <h3 className="font-display font-bold text-primary text-xl mb-3">{step.title}</h3>
                <p className="text-neutral text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>

              {/* Connector — right side on desktop, bottom on mobile */}
              {i < steps.length - 1 && (
                <>
                  {/* Desktop: vertical dashed line between steps */}
                  <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0 self-center">
                    <div className="w-full border-t-2 border-dashed border-secondary/30" />
                  </div>

                  {/* Mobile: horizontal dashed line below step */}
                  <div className="lg:hidden flex justify-center py-1 ml-8">
                    <div className="h-8 border-l-2 border-dashed border-secondary/30" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
