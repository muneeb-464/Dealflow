"use client";
import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By creating an account or using Dealflow, you agree to these Terms of Service. If you are using Dealflow on behalf of a company, you represent that you have authority to bind that company to these terms. If you do not agree, do not use the service.",
  },
  {
    title: "Description of Service",
    body: "Dealflow is a CRM and deal management platform for freelancers and agencies. We provide lead tracking, client management, team collaboration, and revenue analytics tools. Features vary by subscription plan. We reserve the right to modify or discontinue features with reasonable notice.",
  },
  {
    title: "Account Registration",
    body: "You must provide accurate information when creating an account. You are responsible for maintaining the security of your password and all activity under your account. Notify us immediately at support@dealflow.app if you suspect unauthorized access.",
  },
  {
    title: "Subscription & Billing",
    body: "Paid plans are billed monthly or annually in advance. All fees are non-refundable except where required by law. We will notify you at least 14 days before any price changes. Failure to pay may result in account suspension after a 7-day grace period.",
  },
  {
    title: "Acceptable Use",
    body: "You may not use Dealflow to send spam, violate any laws, infringe intellectual property, or attempt to gain unauthorized access to our systems. We reserve the right to suspend or terminate accounts that violate these terms without prior notice.",
  },
  {
    title: "Your Data & Intellectual Property",
    body: "You retain full ownership of all data you input into Dealflow. By using our service, you grant us a limited license to store and process your data solely to provide the service. We claim no intellectual property rights over your content.",
  },
  {
    title: "Limitation of Liability",
    body: "Dealflow is provided 'as is' without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the fees you paid in the past 12 months.",
  },
  {
    title: "Termination",
    body: "You may cancel your account at any time from Settings. We may terminate or suspend your account for violations of these terms. Upon termination, your right to use the service ceases immediately. Data export is available for 30 days after termination.",
  },
  {
    title: "Governing Law",
    body: "These terms are governed by the laws of the jurisdiction in which Dealflow operates. Disputes will be resolved through binding arbitration, except where prohibited by law. You waive the right to participate in class-action lawsuits against Dealflow.",
  },
];

const faqs = [
  {
    q: "Can I use Dealflow for my entire agency team?",
    a: "Yes. The Pro plan supports up to 10 team members with role-based access. Enterprise plans support unlimited members — contact us for pricing.",
  },
  {
    q: "What happens if I miss a payment?",
    a: "We'll retry your payment method 3 times over 7 days. If payment still fails, your account is downgraded to the free plan. Your data is preserved — you won't lose anything.",
  },
  {
    q: "Can I switch between monthly and yearly plans?",
    a: "Yes, at any time from Settings. Switching to yearly gives you a 20% discount. The change takes effect at your next billing cycle.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a full refund within 7 days of your first subscription charge if you're unsatisfied. After that, fees are non-refundable, but you can cancel anytime to avoid future charges.",
  },
  {
    q: "Is Dealflow GDPR compliant?",
    a: "Yes. Dealflow is designed with GDPR compliance in mind. We offer data processing agreements (DPA) for business customers. Contact privacy@dealflow.app to request one.",
  },
  {
    q: "Can I white-label or resell Dealflow?",
    a: "White-labeling is available on the Enterprise plan. Reselling or sublicensing without written permission from Dealflow is not permitted under these terms.",
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

export default function TermsPage() {
  return (
    <main className="font-sans bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-white px-6 lg:px-16 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.1) 0%, transparent 65%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-secondary text-xs px-3.5 py-1.5 rounded-full font-semibold mb-5">
            <span>📄</span> Terms of Service
          </div>
          <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">Clear terms, no surprises</h1>
          <p className="text-white/50 text-base max-w-lg mx-auto">Last updated: May 17, 2026. Plain language. No legalese traps.</p>
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
          <h2 className="font-display font-bold text-primary text-3xl">Terms questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-16 pb-16 max-w-4xl mx-auto w-full">
        <div className="bg-primary rounded-2xl p-8 text-center">
          <p className="font-display font-bold text-white text-lg mb-2">Questions about our terms?</p>
          <p className="text-white/50 text-sm mb-6">We're happy to clarify anything before you commit. Reach out anytime.</p>
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
