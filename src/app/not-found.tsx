"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function NotFound() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.012;
      if (orbRef.current) {
        orbRef.current.style.transform = `translate(${Math.sin(t) * 18}px, ${Math.cos(t * 0.7) * 12}px)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">

      {/* Animated background rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 animate-ping" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-secondary/15" />
      </div>

      {/* Floating orb */}
      <div ref={orbRef} className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none transition-none" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)" }} />

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-secondary/40 animate-pulse" />
      <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-secondary/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-8 left-8 w-2 h-2 rounded-full bg-secondary/20 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-8 right-8 w-2 h-2 rounded-full bg-secondary/40 animate-pulse" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-lg">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">DEAL<span className="text-secondary">FLOW</span></span>
        </Link>

        {/* 404 number */}
        <div className="relative">
          <span
            className="font-display font-bold text-white/5 select-none pointer-events-none"
            style={{ fontSize: "clamp(7rem, 20vw, 14rem)", lineHeight: 1 }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center animate-bounce" style={{ animationDuration: "2s" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-secondary" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M8 11h6M11 8v6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="font-display font-bold text-white text-2xl lg:text-3xl">
            Page not found
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            This page doesn&apos;t exist or was moved.<br />
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 bg-secondary text-primary font-bold px-6 py-3 rounded-full text-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-secondary/25 hover:scale-105 active:scale-100"
          >
            Go to Dashboard
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/"
            className="text-white/50 text-sm font-medium hover:text-white transition-colors px-4 py-3"
          >
            ← Back to home
          </Link>
        </div>

      </div>
    </main>
  );
}
