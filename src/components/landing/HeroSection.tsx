import Image from "next/image";
import img1 from "./assests/image 1.jpg";
import img2 from "./assests/iamgew 2.jpg";
import img3 from "./assests/iamge 3.jpg";
import img4 from "./assests/iamge 4.jpg";

const avatars = [img1, img2, img3, img4];

const deals = [
  { name: "TechCorp Series A", amount: "$2.5M", stage: "Negotiation", active: true },
  { name: "Retail Chain B2B", amount: "$840K", stage: "Due Diligence", active: false },
  { name: "SaaS Platform", amount: "$1.2M", stage: "Initial Contact", active: true },
];

const tasks = [
  { label: "Brand New Website Design", done: true },
  { label: "Super Formed Analysis", done: false },
  { label: "App Redesign Review", done: false },
];

const bars = [
  { label: "Deals Closed", pct: 68, color: "#4ADE80" },
  { label: "Revenue", pct: 74, color: "#F97316" },
  { label: "Pipeline", pct: 58, color: "#4ADE80" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "calc(100vh - 68px)" }}>

      {/* Diagonal bg */}
      <div
        className="absolute bg-primary"
        style={{
          top: "45%", left: "-5%", right: "-5%", bottom: "-5%",
          borderRadius: "3.5rem 3.5rem 3.5rem 3.5rem",
          transform: "skewY(-4deg)",
          transformOrigin: "right center",
        }}
      />

      {/* Glow */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ width: "480px", height: "480px", top: "5%", right: "5%", background: "radial-gradient(circle, rgba(74,222,128,0.11) 0%, transparent 70%)" }} />

      {/* Rings */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full border border-white/5 translate-x-1/4 translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full border border-white/5 translate-x-1/4 translate-y-1/4" />
      <div className="absolute bottom-14 right-16 w-10 h-10 rounded-full bg-secondary/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full pl-6 pr-6 md:pl-10 md:pr-8 lg:pl-16 lg:pr-12 pt-10 lg:pt-0">

        {/* Main row */}
        <div className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-8 py-12 lg:py-0">

          {/* Left: text */}
          <div className="w-full lg:w-[38%] flex-shrink-0 space-y-6 text-center lg:text-left pl-4 md:pl-12 lg:pl-40">

            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
              New: AI-Powered Deal Tracking
              <span className="text-tertiary font-bold">→</span>
            </div>

            <h1 className="font-display font-bold leading-[1.08] tracking-tight text-primary" style={{ fontSize: "clamp(2.8rem, 4.5vw, 4.2rem)" }}>
              Maximize Your<br />
              <span className="text-secondary">Productivity</span>
            </h1>

            <p className="text-neutral text-base lg:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
              Conquer your tasks and take control with our intelligent deal management platform.
            </p>

            <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
              <button className="group inline-flex items-center gap-2 bg-secondary text-primary px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-secondary/30 transition-all duration-300 hover:bg-primary hover:text-secondary hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-100">
                Learn More
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
             <button className="group inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-secondary hover:text-black hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-100">
                Watch Demo ▶
               
              </button>
            </div>

            <div className="flex items-center gap-2.5 justify-center lg:justify-start pt-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-tertiary">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-primary text-sm font-bold">4.8</span>
              <span className="text-neutral text-sm">· 500+ teams trust Dealflow</span>
            </div>
          </div>

          {/* Right: phone cluster */}
          <div className="w-full lg:flex-1 flex items-center justify-center">

            {/* Mobile: single center phone */}
            <div className="lg:hidden relative" style={{ width: "220px" }}>
              <CenterPhone />
            </div>

            {/* Desktop: 3-phone cluster */}
            <div className="hidden lg:block relative" style={{ width: "460px", height: "510px" }}>

              {/* Left blurred phone */}
              <div className="absolute" style={{ left: "-8px", top: "50%", transform: "translateY(-46%) rotate(-8deg)", filter: "blur(2px)", opacity: 0.7, zIndex: 5 }}>
                <SidePhone type="analytics" />
              </div>

              {/* Center main phone */}
              <div className="absolute" style={{ left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%)", zIndex: 15 }}>
                <CenterPhone />
              </div>

              {/* Right blurred phone */}
              <div className="absolute" style={{ right: "-8px", top: "50%", transform: "translateY(-46%) rotate(8deg)", filter: "blur(2px)", opacity: 0.7, zIndex: 5 }}>
                <SidePhone type="tasks" />
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Bottom-left glossy cards */}
      <div className="relative lg:absolute lg:bottom-8 lg:left-52 z-20 flex flex-wrap justify-center lg:justify-start gap-3 px-6 pb-8 lg:px-0 lg:pb-0">

        {/* Custom Workflow card */}
        <div className="flex items-center gap-3.5 px-5 py-4 rounded-2xl border border-white/15" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-secondary" style={{ background: "rgba(74,222,128,0.12)" }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}><path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <p className="text-white text-sm font-semibold font-display">Custom Workflow</p>
            <p className="text-white/50 text-xs mt-0.5">Build pipelines that match your process</p>
          </div>
        </div>

        {/* Multi-team Projects card with real avatars */}
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/15" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-secondary" style={{ background: "rgba(74,222,128,0.12)" }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-white text-sm font-semibold font-display">Multi-team Projects</p>
              <p className="text-white/50 text-xs mt-0.5">Collaborate across departments</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {avatars.map((src, i) => (
                  <Image key={i} src={src} alt="team member" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-white/20 object-cover" />
                ))}
                <div className="w-8 h-8 rounded-full bg-secondary/30 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">+3</span>
                </div>
              </div>
              <span className="text-white/60 text-xs">Team Active</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}

function CenterPhone() {
  return (
    <div className="relative">
      <div className="relative bg-white overflow-hidden" style={{ width: "220px", height: "460px", borderRadius: "2.6rem 2.6rem 3.5rem 3.5rem", boxShadow: "0 40px 80px -10px rgba(10,42,34,0.55), 0 0 0 1px rgba(0,0,0,0.06)" }}>
        <div className="bg-neutral-light px-5 pt-4 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-neutral font-semibold">9:41</span>
          <div className="w-12 h-1 bg-primary/15 rounded-full" />
          <div className="w-3.5 h-2 border border-neutral/30 rounded-sm relative">
            <div className="absolute inset-0.5 bg-primary/60 rounded-sm" style={{ width: "55%" }} />
          </div>
        </div>
        <div className="px-4 pt-3 pb-14 space-y-3 overflow-hidden">
          <div>
            <p className="text-neutral text-xs">Hello, Muneeb 👋</p>
            <p className="font-display font-bold text-primary text-sm mt-0.5">Deal Overview</p>
          </div>
          <div className="bg-primary rounded-2xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-[10px] font-medium">Total Pipeline</span>
              <span className="text-secondary text-xs font-bold font-display">$4.54M</span>
            </div>
            <div className="w-full bg-white/15 rounded-full h-1.5 mb-1.5">
              <div className="bg-secondary h-1.5 rounded-full" style={{ width: "68%" }} />
            </div>
            <p className="text-white/40 text-[10px]">68% close rate · Q2 2026</p>
          </div>
          <div className="space-y-2.5">
            {deals.map((deal) => (
              <div key={deal.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${deal.active ? "bg-secondary" : "bg-tertiary"}`} />
                  <div>
                    <p className="text-primary text-[11px] font-semibold leading-tight">{deal.name}</p>
                    <p className="text-neutral text-[10px]">{deal.stage}</p>
                  </div>
                </div>
                <span className="text-primary text-[11px] font-bold font-display">{deal.amount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-around items-center px-6 py-3 border-t border-neutral/10 bg-white">
          {[
            <svg key="h" viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" /><polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" /></svg>,
            <svg key="s" viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" /></svg>,
            <svg key="u" viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" /><circle cx="12" cy="7" r="4" /></svg>,
          ].map((icon, i) => (
            <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center ${i === 0 ? "bg-primary text-secondary" : "bg-neutral-light text-neutral"}`}>{icon}</div>
          ))}
        </div>
      </div>

      {/* Floating: top-right */}
      <div className="absolute -top-2 -right-24 bg-white rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2 min-w-[148px] hidden lg:flex">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(74,222,128,0.15)" }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div>
          <p className="text-primary text-xs font-semibold font-display">Deal Closed</p>
          <p className="text-neutral text-[10px]">TechCorp · $2.5M ✓</p>
        </div>
      </div>

    </div>
  );
}

function SidePhone({ type }: { type: "analytics" | "tasks" }) {
  return (
    <div className="bg-white overflow-hidden" style={{ width: "165px", height: "345px", borderRadius: "2rem 2rem 3rem 3rem", boxShadow: "0 20px 50px rgba(10,42,34,0.3)" }}>
      <div className="bg-neutral-light px-4 pt-3 pb-2 flex items-center justify-between">
        <span className="text-[9px] text-neutral font-semibold">9:41</span>
        <div className="w-8 h-1 bg-primary/15 rounded-full" />
      </div>

      {type === "analytics" ? (
        <div className="px-3 pt-3 space-y-3">
          <div>
            <p className="text-neutral text-[9px]">This month</p>
            <p className="font-display font-bold text-primary text-xs mt-0.5">Analytics</p>
          </div>
          <div className="space-y-2">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-neutral">{b.label}</span>
                  <span className="text-[9px] font-bold text-primary">{b.pct}%</span>
                </div>
                <div className="w-full bg-neutral/15 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[{ v: "24", l: "Closed" }, { v: "$12.4M", l: "Revenue" }].map((s) => (
              <div key={s.l} className="bg-neutral-light rounded-xl p-2">
                <p className="font-display font-bold text-primary text-xs">{s.v}</p>
                <p className="text-neutral text-[9px] mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="bg-primary/5 rounded-xl p-2">
            <p className="text-primary text-[9px] font-semibold mb-1.5">Deal Velocity</p>
            <div className="flex items-end gap-1 h-7">
              {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-secondary/60 rounded-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 pt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral text-[9px]">Ongoing</p>
              <p className="font-display font-bold text-primary text-xs mt-0.5">Task List</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="#4ADE80" strokeWidth={3}><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" /></svg>
            </div>
          </div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ${t.done ? "bg-secondary" : "border border-neutral/30"}`}>
                  {t.done && <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5" stroke="#0A2A22" strokeWidth={3}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <p className={`text-[9px] leading-tight ${t.done ? "line-through text-neutral/50" : "text-primary font-medium"}`}>{t.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-neutral-light rounded-xl p-2">
            <div className="flex justify-between mb-1.5">
              <span className="text-[9px] text-neutral">Progress</span>
              <span className="text-[9px] font-bold text-primary">1/3</span>
            </div>
            <div className="w-full bg-neutral/15 rounded-full h-1">
              <div className="bg-secondary h-1 rounded-full w-1/3" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-neutral font-medium">Members</p>
            <div className="flex -space-x-1">
              {["A", "B", "C"].map((l) => (
                <div key={l} className="w-5 h-5 rounded-full bg-primary border border-white flex items-center justify-center">
                  <span className="text-secondary font-bold" style={{ fontSize: "6px" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
