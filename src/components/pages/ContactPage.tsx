"use client";
import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  const contacts = [
    {
      label: "Email",
      value: "hello@dealflow.app",
      icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    },
    {
      label: "Twitter / X",
      value: "@dealflowapp",
      icon: "M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43 1s-2 .9-3.36 1.22A4.48 4.48 0 0 0 11.5 6.35a12.73 12.73 0 0 1-9.24-4.69s-4 9 5 13a11.06 11.06 0 0 1-6.54 1.85c9 5.5 20 0 20-11.5a4.49 4.49 0 0 0-.08-.84A7.72 7.72 0 0 0 23 3z",
    },
    {
      label: "LinkedIn",
      value: "Dealflow HQ",
      icon: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    },
  ];

  const inputCls = "w-full bg-neutral-light text-primary text-sm placeholder:text-neutral/50 px-4 py-3.5 rounded-xl border border-neutral/10 focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 transition-all duration-200";

  return (
    <main className="font-sans min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary px-6 py-16 lg:py-20 text-center">
        <div className="inline-flex items-center gap-2 text-secondary text-xs font-bold tracking-widest uppercase mb-5">
          Contact
        </div>
        <h1 className="font-display font-bold text-white text-4xl lg:text-5xl mb-4">
          Get in touch
        </h1>
        <p className="text-white/50 text-base max-w-md mx-auto">
          Questions, feedback, or partnership ideas — we read every message.
        </p>
      </section>

      {/* Body */}
      <section className="flex-1 bg-white px-6 lg:px-12 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — contact cards */}
          <div>
            <h2 className="font-display font-bold text-primary text-lg mb-6">Other ways to reach us</h2>
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.label} className="flex items-center gap-4 bg-white border border-neutral/15 rounded-2xl px-5 py-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-neutral-light flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-neutral" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
                      <path d={c.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-neutral text-xs">{c.label}</p>
                    <p className="text-primary text-sm font-semibold">{c.value}</p>
                  </div>
                </div>
              ))}

              {/* Response time card */}
              <div className="bg-secondary/8 border border-secondary/20 rounded-2xl px-5 py-4">
                <p className="text-primary text-sm font-bold mb-0.5">Response time</p>
                <p className="text-neutral text-sm">We reply within 24 hours on business days.</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/25 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-primary text-xl mb-1">Message sent!</h3>
                  <p className="text-neutral text-sm">We&apos;ll get back to you within 24 hours.</p>
                </div>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="text-secondary text-sm font-semibold hover:underline"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-2">Name *</label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-2">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={inputCls} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-2">Subject</label>
                  <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="What&apos;s this about?" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-2">Message *</label>
                  <textarea value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us what&apos;s on your mind..." rows={6} className={`${inputCls} resize-none`} required />
                </div>
                <button
                  type="submit"
                  className="group w-full inline-flex items-center justify-center gap-2 bg-primary text-secondary py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-secondary hover:text-primary hover:scale-[1.01] active:scale-100"
                >
                  Send Message
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
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
