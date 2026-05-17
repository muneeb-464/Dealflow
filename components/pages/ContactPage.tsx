"use client";
import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const channels = [
  { label: "Email", value: "hello@dealflow.app", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" },
  { label: "Twitter / X", value: "@dealflowapp", icon: "M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43 1s-2 .9-3.36 1.22A4.48 4.48 0 0 0 11.5 6.35a12.73 12.73 0 0 1-9.24-4.69s-4 9 5 13a11.06 11.06 0 0 1-6.54 1.85c9 5.5 20 0 20-11.5a4.49 4.49 0 0 0-.08-.84A7.72 7.72 0 0 0 23 3z" },
  { label: "LinkedIn", value: "Dealflow HQ", icon: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  const inputCls = "w-full bg-neutral-light text-primary text-sm placeholder:text-neutral/50 px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 transition-colors";

  return (
    <main className="font-sans bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-primary text-white px-6 lg:px-16 py-16 text-center">
        <p className="text-secondary text-xs font-semibold uppercase tracking-widest mb-3">Contact</p>
        <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">Get in touch</h1>
        <p className="text-white/50 text-base max-w-md mx-auto">Questions, feedback, or partnership ideas — we read every message.</p>
      </section>

      {/* Content */}
      <section className="px-6 lg:px-16 py-16 max-w-5xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Channels */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-primary text-lg mb-6">Other ways to reach us</h2>
            {channels.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-light border border-neutral/10 transition-all duration-300 hover:-translate-y-1 cursor-default"
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 16px 48px -8px rgba(74,222,128,0.25)";
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "";
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral/10 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }} className="text-primary">
                    <path d={c.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-neutral text-xs">{c.label}</p>
                  <p className="text-primary text-sm font-semibold">{c.value}</p>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 rounded-2xl border border-secondary/20 bg-secondary/5">
              <p className="text-primary text-sm font-semibold mb-1">Response time</p>
              <p className="text-neutral text-sm">We reply within 24 hours on business days.</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-primary text-xl">Message sent!</h3>
                <p className="text-neutral text-sm">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="mt-2 text-secondary text-sm font-semibold hover:underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1.5">Name *</label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={inputCls} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">Subject</label>
                  <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="What's this about?" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us what's on your mind..." rows={6} className={`${inputCls} resize-none`} required />
                </div>
                <button
                  type="submit"
                  className="group w-full inline-flex items-center justify-center gap-2 bg-primary text-secondary py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-xl hover:shadow-secondary/25 hover:scale-[1.02] active:scale-100"
                >
                  Send Message
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
