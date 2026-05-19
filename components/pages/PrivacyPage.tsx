"use client";
import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly: name, email address, workspace name, and billing details when you subscribe. We also collect usage data — pages visited, features used, and actions taken inside the app — to improve the product. We do not sell your personal data to third parties.",
  },
  {
    title: "How We Use Your Information",
    body: "Your data is used to operate and improve Dealflow, send transactional emails (reminders, invoices, alerts), respond to support requests, and comply with legal obligations. We may use anonymized, aggregated data for product analytics.",
  },
  {
    title: "Data Storage & Security",
    body: "All data is stored on encrypted servers. We use industry-standard TLS encryption for data in transit and AES-256 for data at rest. Access to production data is restricted to authorized personnel only. We perform regular security audits.",
  },
  {
    title: "Cookies",
    body: "We use essential cookies to keep you logged in and remember your preferences. We do not use third-party advertising cookies. You can disable cookies in your browser settings, but some features may not work correctly.",
  },
  {
    title: "Third-Party Services",
    body: "Dealflow integrates with payment processors (Stripe), email delivery providers, and currency APIs. Each third party is bound by their own privacy policies. We only share the minimum data necessary for these services to function.",
  },
  {
    title: "Your Rights",
    body: "You can request a copy of your data, correct inaccurate information, or delete your account at any time from Settings. For GDPR or CCPA requests, email us at privacy@dealflow.app. We respond within 30 days.",
  },
  {
    title: "Data Retention",
    body: "We retain your data for as long as your account is active. If you delete your account, all personal data is permanently removed within 30 days, except where we are required by law to retain it longer.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this policy periodically. We will notify you by email at least 14 days before any material changes take effect. Continued use of Dealflow after that date constitutes acceptance of the updated policy.",
  },
];

const faqs = [
  {
    q: "Is my client data visible to anyone at Dealflow?",
    a: "No. Access to production data is restricted to a small number of authorized engineers for debugging purposes only, under strict access controls and audit logs.",
  },
  {
    q: "Can I export all my data?",
    a: "Yes. You can export your leads, clients, and revenue data as CSV from the Settings page at any time. No lock-in.",
  },
  {
    q: "Do you share data with advertisers?",
    a: "Never. We do not sell, rent, or share your personal data with advertisers or data brokers.",
  },
  {
    q: "Where are Dealflow servers located?",
    a: "Our servers are hosted in the EU and US regions. You can request EU-only data residency on the Business plan.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data remains accessible for 30 days after cancellation in case you want to reactivate. After 30 days, all data is permanently deleted from our systems.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-neutral/10 rounded-2xl overflow-hidden transition-all duration-300"
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ""; }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-secondary/5 transition-colors duration-200"
      >
        <span className="font-display font-semibold text-primary text-sm pr-4">{q}</span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 ${open ? "bg-primary text-secondary rotate-45" : "bg-neutral-light text-neutral"}`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48" : "max-h-0"}`}>
        <p className="px-6 pb-5 text-neutral text-sm leading-relaxed border-t border-neutral/8 pt-4">{a}</p>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="font-sans bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-white px-6 lg:px-16 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.1) 0%, transparent 65%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-secondary text-xs px-3.5 py-1.5 rounded-full font-semibold mb-5">
            <span>🔒</span> Privacy Policy
          </div>
          <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">Your data, your rights</h1>
          <p className="text-white/50 text-base max-w-lg mx-auto">Last updated: May 17, 2026. We keep this simple and honest.</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 lg:px-16 py-16 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          {sections.map((s, i) => (
            <div
              key={s.title}
              className="flex gap-6 p-6 rounded-2xl border border-neutral/10 bg-white transition-all duration-300 hover:-translate-y-0.5 cursor-default"
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 16px 48px -8px rgba(74,222,128,0.2)";
                e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-display font-bold text-secondary text-xs">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-display font-bold text-primary text-base mb-2">{s.title}</p>
                <p className="text-neutral text-sm leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 lg:px-16 py-16 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold mb-4">
            <span className="text-secondary">✦</span> FAQ
          </div>
          <h2 className="font-display font-bold text-primary text-3xl">Privacy questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-16 pb-16 max-w-4xl mx-auto w-full">
        <div className="bg-primary rounded-2xl p-8 text-center">
          <p className="font-display font-bold text-white text-lg mb-2">Still have questions?</p>
          <p className="text-white/50 text-sm mb-6">Email us at privacy@dealflow.app — we reply within 24 hours.</p>
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 bg-secondary text-primary px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-secondary/30 transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 active:scale-100"
          >
            Contact Us
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
