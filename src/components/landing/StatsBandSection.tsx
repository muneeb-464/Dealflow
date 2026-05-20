"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { target: 500,   prefix: "",  suffix: "+",   label: "Teams using Dealflow" },
  { target: 12,    prefix: "$", suffix: "M+",  label: "Revenue tracked" },
  { target: 10000, prefix: "",  suffix: "+",   label: "Leads managed" },
];

export default function StatsBandSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stats.forEach((stat, i) => {
        const el = numRefs.current[i];
        if (!el) return;

        const obj = { val: 0 };

        gsap.to(obj, {
          val: stat.target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            const rounded = Math.floor(obj.val);
            const formatted = rounded >= 1000
              ? rounded.toLocaleString()
              : String(rounded);
            el.textContent = `${stat.prefix}${formatted}${stat.suffix}`;
          },
        });
      });

      gsap.fromTo(
        sectionRef.current!.querySelectorAll(".stat-label"),
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-primary py-16 overflow-hidden">

      {/* Bottom-left decorative rings */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full border border-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full border border-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-10 left-14 w-10 h-10 rounded-full bg-secondary/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <div className="text-center px-10 lg:px-24">
                <span
                  ref={el => { numRefs.current[i] = el; }}
                  className="font-display font-bold text-secondary text-5xl lg:text-6xl tabular-nums"
                >
                  {stat.prefix}0{stat.suffix}
                </span>
                <p className="stat-label text-white/50 text-sm mt-2 font-medium">{stat.label}</p>
              </div>

              {/* Divider — desktop only */}
              {i < stats.length - 1 && (
                <div className="hidden sm:block w-px h-12 bg-white/10 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
