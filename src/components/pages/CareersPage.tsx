"use client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const jobs = [
  {
    title: "Full-Stack Engineer",
    type: "Full-time · Remote",
    team: "Engineering",
    desc: "Build and ship features that freelancers use every day. We work with Next.js, Node.js, and MongoDB.",
    skills: ["Next.js", "TypeScript", "MongoDB", "Node.js"],
  },
  {
    title: "Product Designer",
    type: "Full-time · Remote",
    team: "Design",
    desc: "Own the end-to-end design of Dealflow. From user research to shipped pixels. We care about clarity, not complexity.",
    skills: ["Figma", "UX Research", "Design Systems", "Prototyping"],
  },
  {
    title: "Customer Success Manager",
    type: "Full-time · Remote",
    team: "Growth",
    desc: "Help freelancers and agency owners get the most out of Dealflow. You'll be the bridge between users and product.",
    skills: ["SaaS", "Onboarding", "Support", "Communication"],
  },
  {
    title: "Growth Marketer",
    type: "Part-time · Remote",
    team: "Marketing",
    desc: "Drive organic growth through content, SEO, and community. Experience in B2B SaaS or freelance communities preferred.",
    skills: ["SEO", "Content", "Analytics", "Community"],
  },
];

const perks = [
  { label: "Fully remote", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Async-first", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { label: "Competitive pay", icon: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { label: "Build real products", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" },
];

const TEAM_CLS: Record<string, string> = {
  Engineering: "bg-secondary/10 text-primary",
  Design: "bg-tertiary/10 text-tertiary",
  Growth: "bg-secondary/20 text-primary",
  Marketing: "bg-primary/8 text-primary",
};

export default function CareersPage() {
  return (
    <main className="font-sans bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-white px-6 lg:px-16 py-16 text-center">
        <p className="text-secondary text-xs font-semibold uppercase tracking-widest mb-3">Careers</p>
        <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">Help us build the future<br className="hidden lg:block" /> of freelance work</h1>
        <p className="text-white/50 text-base max-w-lg mx-auto">We're a small, remote team that ships fast and cares deeply about the people using our product.</p>
      </section>

      {/* Perks */}
      <section className="px-6 lg:px-16  py-12 border-b border-neutral/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {perks.map((p) => (
            <div
              key={p.label}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-neutral-light text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 16px 48px -8px rgba(74,222,128,0.25)";
                e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10  border border-neutral/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={p.icon} />
                </svg>
              </div>
              <p className="text-primary text-sm font-semibold">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Jobs */}
      <section className="px-6 lg:px-16 py-16 max-w-4xl mx-auto w-full flex-1">
        <h2 className="font-display font-bold text-primary text-2xl mb-2">Open roles</h2>
        <p className="text-neutral text-sm mb-8">{jobs.length} positions · All remote</p>
        <div className="space-y-4">
          {jobs.map((j) => (
            <div
              key={j.title}
              className="bg-white border border-neutral/10 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 20px 60px -8px rgba(74,222,128,0.25)";
                e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${TEAM_CLS[j.team] ?? "bg-neutral/10 text-neutral"}`}>{j.team}</span>
                    <span className="text-neutral text-[11px]">{j.type}</span>
                  </div>
                  <h3 className="font-display font-bold text-primary text-base mb-2">{j.title}</h3>
                  <p className="text-neutral text-sm leading-relaxed mb-4">{j.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {j.skills.map((s) => (
                      <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-light text-neutral">{s}</span>
                    ))}
                  </div>
                </div>
                <a
                  href="/contact"
                  className="group flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-secondary text-xs font-semibold rounded-full transition-all duration-300 hover:bg-secondary hover:text-primary hover:shadow-lg hover:shadow-secondary/25 hover:scale-105 active:scale-100"
                >
                  Apply
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-2xl bg-primary text-center">
          <p className="font-display font-bold text-white text-lg mb-2">Don't see a fit?</p>
          <p className="text-white/50 text-sm mb-6">Send us a message anyway. We're always looking for great people.</p>
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 bg-secondary text-primary px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-secondary/30 transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-xl hover:shadow-secondary/20 hover:scale-105 active:scale-100"
          >
            Get in touch
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
