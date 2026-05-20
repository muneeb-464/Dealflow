"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current!.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 0.8, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: contentRef.current, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-primary py-24 overflow-hidden">

      {/* Bottom-right rings */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full border border-white/5 translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full border border-white/5 translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-14 right-16 w-10 h-10 rounded-full bg-secondary/10 pointer-events-none" />

      {/* Bottom-left rings */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full border border-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full border border-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-14 left-16 w-10 h-10 rounded-full bg-secondary/10 pointer-events-none" />

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(74,222,128,0.07) 0%, transparent 60%)" }} />

      {/* Content */}
      <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-5">

        {/* Label */}
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 text-secondary text-xs px-4 py-1.5 rounded-full font-semibold">
          ✦ Start for free today
        </div>

        {/* Headline */}
        <h2 className="font-display font-bold text-white text-4xl lg:text-6xl leading-tight">
          Ready to close<br />
          more <span className="text-secondary">deals?</span>
        </h2>

        {/* Subtext */}
        <p className="text-white/50 text-base max-w-md leading-relaxed">
          Join 500+ freelancers and agencies already using Dealflow
          to track leads, manage clients, and grow revenue.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/dashboard" className="group inline-flex items-center gap-2 bg-secondary text-primary font-bold px-8 py-4 rounded-full text-sm shadow-lg shadow-secondary/20 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-secondary/25 hover:scale-105 active:scale-100">
            Get Started Free
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button className="text-white/60 text-sm font-medium hover:text-white transition-colors px-4 py-4">
            Watch Demo ▶
          </button>
        </div>

        {/* Trust note */}
        <p className="text-white/30 text-xs">
          No credit card required · Free forever plan · Setup in 2 minutes
        </p>

      </div>
    </section>
  );
}
