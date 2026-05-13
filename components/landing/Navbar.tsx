"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import updateLogo from "./assests/update logo.png";

const leftNav = ["Services", "How it works", "About us"];
const rightNav = ["Workspace & Team", "Settings"];
const dashboardLinks = [
  { label: "Clients & Orders", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { label: "Reminders", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" },
  { label: "Leads Tracker", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { label: "Revenue Tracking", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { label: "Analytics", icon: "M18 20V10M12 20V4M6 20v-6" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);

  return (
    <nav className="relative z-30">
      <div className="px-6 md:px-10 lg:px-16 py-4 flex items-center justify-between">

        {/* Desktop left links */}
        <div className="hidden lg:flex items-center gap-7">
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-neutral hover:text-primary transition-colors font-medium">Services</button>
          <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-neutral hover:text-primary transition-colors font-medium">How it works</button>
          <button onClick={() => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-neutral hover:text-primary transition-colors font-medium">About us</button>
        </div>

        {/* Logo — centered on desktop, left on mobile */}
        <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <div className="flex items-center gap-2">
            <Image src={updateLogo} alt="Dealflow icon" width={32} height={32} className="object-contain" />
            <span className="font-display font-bold text-xl tracking-tight text-primary">
              DEAL<span className="text-secondary">FLOW</span>
            </span>
          </div>
        </div>

        {/* Desktop right links */}
        <div className="hidden lg:flex items-center gap-5">

          {/* Dashboard dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1">
              <Link href="/dashboard" className="text-sm text-neutral hover:text-primary transition-colors font-medium">
                Dashboard
              </Link>
              <button
                onClick={() => setDashOpen(!dashOpen)}
                onBlur={() => setTimeout(() => setDashOpen(false), 150)}
                className="text-neutral hover:text-primary transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className={`w-3 h-3 mt-px transition-transform duration-200 ${dashOpen ? "rotate-180" : ""}`} stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {dashOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-neutral/10 py-2 z-50">
                {dashboardLinks.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral hover:text-primary hover:bg-neutral-light transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {rightNav.map((item) => (
            <a key={item} className="text-sm text-neutral hover:text-primary transition-colors font-medium cursor-pointer">{item}</a>
          ))}

          <div className="w-px h-4 bg-neutral/20" />

          <a href="/login" className="text-sm text-neutral hover:text-primary transition-colors font-medium cursor-pointer">Login</a>
          <a href="/register" className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors cursor-pointer">Sign Up</a>
        </div>

        {/* Mobile right: avatar + hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-primary text-xs font-bold font-display">MA</span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral/20 hover:bg-neutral-light transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`w-4.5 h-0.5 bg-primary rounded-full transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} style={{ width: "18px" }} />
            <span className={`h-0.5 bg-primary rounded-full transition-all duration-200 ${menuOpen ? "opacity-0" : "opacity-100"}`} style={{ width: "18px" }} />
            <span className={`w-4.5 h-0.5 bg-primary rounded-full transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} style={{ width: "18px" }} />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-neutral/10 shadow-xl z-40 px-6 py-5 flex flex-col gap-1">
          {leftNav.map((item) => (
            <button key={item} className="text-left py-3 px-4 text-sm font-medium text-primary hover:bg-neutral-light rounded-xl transition-colors" onClick={() => setMenuOpen(false)}>
              {item}
            </button>
          ))}
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-neutral uppercase tracking-wider">Dashboard</p>
          {dashboardLinks.map((item) => (
            <button key={item.label} className="text-left py-2.5 px-4 text-sm font-medium text-primary hover:bg-neutral-light rounded-xl transition-colors flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <div className="w-6 h-6 rounded-md bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              {item.label}
            </button>
          ))}
          {rightNav.map((item) => (
            <button key={item} className="text-left py-3 px-4 text-sm font-medium text-primary hover:bg-neutral-light rounded-xl transition-colors" onClick={() => setMenuOpen(false)}>
              {item}
            </button>
          ))}
          <div className="mt-3 pt-3 border-t border-neutral/10 flex gap-3">
            <a href="/login" className="flex-1 py-3 border border-neutral/25 text-primary text-sm font-semibold rounded-full text-center">Login</a>
            <a href="/register" className="flex-1 py-3 bg-primary text-white text-sm font-semibold rounded-full text-center">Sign Up</a>
          </div>
        </div>
      )}
    </nav>
  );
}
