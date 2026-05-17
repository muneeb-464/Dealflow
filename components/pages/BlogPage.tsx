"use client";
import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  read: string;
  excerpt: string;
  content: string[];
};

const posts: Post[] = [
  {
    slug: "how-to-follow-up-without-being-annoying",
    title: "How to follow up with clients without being annoying",
    category: "Client Management",
    date: "May 10, 2026",
    read: "4 min read",
    excerpt: "The difference between a closed deal and a ghosted proposal is often one well-timed follow-up. Here's the framework we use.",
    content: [
      "Most freelancers either follow up too aggressively or not at all. Both kill deals. The sweet spot is a system — not a feeling.",
      "After sending a proposal, wait 48 hours before the first follow-up. Keep it short: one line, no pressure. Something like \"Just checking if you had a chance to look this over\" works better than a long re-pitch.",
      "If there's still no reply after 5 days, send a value-add follow-up. Share a relevant insight, a case study, or a quick tip related to their project. This reframes you from 'waiting for an answer' to 'someone worth talking to'.",
      "The third follow-up, if needed, is your closing message. Acknowledge the silence, offer a clear exit: \"No worries if the timing isn't right — happy to reconnect whenever it makes sense.\" This often gets replies because it removes pressure.",
      "Dealflow automates this entire sequence. Set the intervals once, and the system flags overdue leads and sends you reminders — so you never have to guess when to follow up again.",
    ],
  },
  {
    slug: "freelance-crm-vs-spreadsheet",
    title: "Why your spreadsheet CRM is costing you clients",
    category: "Freelancing",
    date: "Apr 28, 2026",
    read: "6 min read",
    excerpt: "Spreadsheets are great for data. They're terrible for relationships. Here's what you lose when you manage clients in rows and columns.",
    content: [
      "Spreadsheets feel productive. Rows, columns, color codes — it looks like a system. But a spreadsheet doesn't know that a client hasn't heard from you in 9 days. It doesn't send you a reminder. It doesn't tell you which platform converts best.",
      "The real cost isn't the spreadsheet itself — it's the mental overhead. Every time you open it, you have to re-orient yourself. Who needs a follow-up? Which proposal is still pending? What's the status of that big client from last month?",
      "That cognitive load adds up. Studies show context-switching costs up to 40% of productive time. For freelancers managing 10–30 active leads, that's hours every week spent just trying to remember where things stand.",
      "A purpose-built CRM like Dealflow gives you a live pipeline view. You see every lead's status at a glance, get automatic reminders for overdue follow-ups, and track revenue without manual calculations.",
      "The switch takes an afternoon. The time you get back compounds every week.",
    ],
  },
  {
    slug: "agency-owner-revenue-tracking",
    title: "Revenue tracking for agency owners: what actually matters",
    category: "Revenue",
    date: "Apr 14, 2026",
    read: "5 min read",
    excerpt: "MRR, ARR, LTV — the metrics that matter vary by business stage. Here's how to track revenue without drowning in dashboards.",
    content: [
      "Early-stage agencies obsess over MRR. Mid-stage agencies obsess over LTV. Neither metric matters if you don't know what you collected last month versus what you invoiced.",
      "Start with cash collected, not invoiced. Many agencies look healthy on paper but struggle with cash flow because they confuse booked revenue with received revenue. Track both, separately.",
      "The second metric that matters early is revenue by platform. If 70% of your revenue comes from one platform, that's a concentration risk. Knowing this forces you to diversify before the problem becomes a crisis.",
      "Once you're past $10k/month, start tracking client lifetime value by service type. Some services look profitable per project but require so much revision that the hourly rate collapses. LTV by service type surfaces this.",
      "Dealflow tracks all of this automatically — multi-currency revenue, platform breakdown, and team performance — without a separate analytics tool.",
    ],
  },
  {
    slug: "team-collaboration-remote-agency",
    title: "How remote agencies keep their teams aligned on client work",
    category: "Team",
    date: "Mar 30, 2026",
    read: "7 min read",
    excerpt: "Clear ownership, async updates, and role-based access are the foundation of a remote agency that doesn't drop balls.",
    content: [
      "The biggest challenge in remote agencies isn't communication — it's ownership. When a lead slips through or a follow-up is missed, the usual answer is 'I thought someone else was handling it.' Clear assignment solves this.",
      "Every lead and client should have one owner. Not a team, not a shared inbox — one person who is accountable. Everything else can be collaborative, but accountability must be singular.",
      "Async-first doesn't mean no communication. It means defaulting to written, timestamped updates over meetings. A quick status update in the CRM — 'called, left voicemail, following up Thursday' — is more useful than a 30-minute sync.",
      "Role-based access matters more than most agencies realize. When everyone sees everything, nobody owns anything. Employees should see their leads. Managers should see their team's leads. Owners should see everything.",
      "Dealflow's workspace model is built around this. Assign leads to team members, set role-based views, and get a manager-level overview without micromanaging every interaction.",
    ],
  },
];

const CATEGORY_COLOR: Record<string, { bg: string; text: string; accent: string; shadow: string }> = {
  "Client Management": { bg: "bg-primary",      text: "text-secondary", accent: "bg-secondary", shadow: "0 20px 60px -8px rgba(74,222,128,0.45)"  },
  "Freelancing":       { bg: "bg-tertiary/10",  text: "text-tertiary",  accent: "bg-tertiary",  shadow: "0 20px 60px -8px rgba(249,115,22,0.4)"   },
  "Revenue":           { bg: "bg-secondary/15", text: "text-primary",   accent: "bg-secondary", shadow: "0 20px 60px -8px rgba(74,222,128,0.35)"  },
  "Team":              { bg: "bg-primary/8",    text: "text-primary",   accent: "bg-primary",   shadow: "0 20px 60px -8px rgba(10,42,34,0.3)"     },
};

export default function BlogPage() {
  const [active, setActive] = useState<Post | null>(null);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <main className="font-sans bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-primary text-white px-6 lg:px-16 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(74,222,128,0.12) 0%, transparent 65%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-secondary text-xs px-3.5 py-1.5 rounded-full font-semibold mb-5">
            <span className="text-secondary">✦</span> Dealflow Blog
          </div>
          <h1 className="font-display font-bold text-4xl lg:text-6xl mb-4 leading-tight">
            Insights for<br /><span className="text-secondary">freelancers</span> & agencies
          </h1>
          <p className="text-white/50 text-base max-w-lg mx-auto">Practical guides on client management, deal closing, and running a lean agency.</p>
        </div>
      </section>

      {/* Posts */}
      <section className="px-6 lg:px-16 py-16 max-w-6xl mx-auto w-full flex-1">



        {/* Featured post */}
        <article
          onClick={() => setActive(featured)}
          className="group relative bg-primary rounded-3xl p-8 lg:p-10 mb-8 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1"
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 32px 80px -12px rgba(74,222,128,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}
        >
          {/* bg glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-
                  [11px] font-bold px-3 py-1 rounded-full ${CATEGORY_COLOR[featured.category]?.bg ?? "bg-secondary/10"} ${CATEGORY_COLOR[featured.category]?.text ?? "text-primary"}`}>
                  {featured.category}
                </span>
                <span className="text-white/40 text-xs">Featured</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/40 text-xs">{featured.read}</span>
              </div>
              <h2 className="font-display font-bold text-white text-2xl lg:text-3xl leading-snug mb-4">{featured.title}</h2>
              <p className="text-white/55 text-sm leading-relaxed max-w-xl">{featured.excerpt}</p>
            </div>
            <div className="flex items-center gap-2 text-secondary text-sm font-semibold flex-shrink-0">
              <span>Read article</span>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="relative z-10 text-white/30 text-xs mt-6">{featured.date}</p>
        </article>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rest.map((p) => {
            const clr = CATEGORY_COLOR[p.category];
            return (
              <article
                key={p.slug}
                onClick={() => setActive(p)}
                className="group bg-white border border-neutral/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 flex flex-col"
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = clr?.shadow ?? "0 20px 60px -8px rgba(74,222,128,0.35)";
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.4)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "";
                }}
              >
                {/* Top accent bar */}
                <div className={`w-full h-1 ${clr?.accent ?? "bg-secondary"}`} />

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${clr?.bg ?? "bg-secondary/10"} ${clr?.text ?? "text-primary"}`}>{p.category}</span>
                    <span className="text-neutral text-[11px]">{p.read}</span>
                  </div>

                  <h2 className="font-display font-bold text-primary text-sm leading-snug mb-3 flex-1">{p.title}</h2>
                  <p className="text-neutral text-xs leading-relaxed mb-5 line-clamp-2">{p.excerpt}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral/8">
                    <span className="text-neutral/50 text-xs">{p.date}</span>
                    <span className="flex items-center gap-1 text-secondary text-xs font-semibold transition-transform duration-200 group-hover:translate-x-0.5">
                      Read
                      <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8"
          style={{ background: "rgba(10,42,34,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setActive(null)}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-neutral/10 px-8 py-5 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLOR[active.category]?.bg ?? "bg-secondary/10"} ${CATEGORY_COLOR[active.category]?.text ?? "text-primary"}`}>
                  {active.category}
                </span>
                <span className="text-neutral text-xs">{active.read}</span>
                <span className="text-neutral/30 text-xs">·</span>
                <span className="text-neutral text-xs">{active.date}</span>
              </div>
              <button
                onClick={() => setActive(null)}
                className="w-8 h-8 rounded-xl bg-neutral-light flex items-center justify-center text-neutral transition-all duration-200 hover:bg-primary hover:text-secondary"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-8 pt-7 pb-0">
              <h1 className="font-display font-bold text-primary text-2xl leading-snug mb-6">{active.title}</h1>
              {/* Paragraphs — 2 col on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4">
                {active.content.map((para, i) => (
                  <p key={i} className="text-neutral leading-relaxed text-sm">{para}</p>
                ))}
              </div>
            </div>

            {/* CTA strip */}
            <div className="mx-8 my-7 p-5 rounded-2xl bg-primary flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-display font-bold text-white text-sm">Ready to fix your pipeline?</p>
                <p className="text-white/50 text-xs mt-0.5">Start tracking leads in Dealflow — free forever.</p>
              </div>
              <button className="group flex-shrink-0 inline-flex items-center gap-2 bg-secondary text-primary px-5 py-2.5 rounded-full font-semibold text-xs shadow-lg shadow-secondary/30 transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 active:scale-100">
                Get Started Free
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
