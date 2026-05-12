# Dealflow — Landing Page Design Specification

> This file is the single source of truth for the landing page UI.
> Claude Code: read this file fully before writing any landing page component.
> Every section has exact layout, content, and styling instructions.

---

## Design Philosophy

**Aesthetic**: Bold, modern SaaS — dark green dominance with electric green accents.
Not minimal, not loud. Confident and premium.

**Tone**: Professional but energetic. Agency owners and freelancers trust it immediately.

**One thing visitors remember**: The dark green → white contrast with glowing green accents.
Every section alternates dark/light backgrounds to create rhythm.

**Motion**: Subtle. Fade-in on scroll for cards. No bouncing, no aggressive animations.
Smooth hover states only. Performance first.

---

## Global Design Tokens

```css
/* Colors — from tailwind.config */
--primary:       #0A2A22   /* dark green — dark sections, headings */
--secondary:     #4ADE80   /* bright green — CTAs, accents, active */
--tertiary:      #F97316   /* orange — secondary CTA, badges, stars */
--neutral:       #767776   /* muted gray — body text, labels */
--neutral-light: #F5F5F4   /* off-white — card backgrounds */
--white:         #FFFFFF

/* Typography */
font-display: "Plus Jakarta Sans"   /* headings, bold UI numbers */
font-sans:    "Inter"               /* body, labels, descriptions */

/* Spacing rhythm */
Section padding: py-20 lg:py-28
Container:       max-w-7xl mx-auto px-6 lg:px-12

/* Border radius */
Cards:   rounded-2xl (16px)
Buttons: rounded-full
Pills:   rounded-full
Icons:   rounded-xl (12px)
```

---

## Navbar — `components/landing/Navbar.tsx`

**Position**: Fixed top, full width, z-50
**Height**: 68px (this is what hero uses for `calc(100vh - 68px)`)

**Behavior**:
- On top of page: `bg-transparent`
- After 20px scroll: `bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral/10`
- Smooth transition: `transition-all duration-300`

**Layout**: `flex items-center justify-between px-6 lg:px-12`

**Left — Logo**:
```
[ green square icon ] DEALFLOW
```
- Icon: 28x28px, `bg-secondary rounded-lg`, white "D" letter or simple flow icon
- Wordmark: `font-display font-bold text-primary text-xl tracking-tight`
- On transparent navbar: text-white
- On white navbar: text-primary

**Center — Nav Links** (hidden on mobile):
```
Features    How It Works    Pricing    About
```
- `text-sm font-medium text-neutral hover:text-primary transition-colors`
- Gap: `gap-8`

**Right — Actions**:
```
[ Sign in ]   [ Get Started → ]
```
- Sign in: `text-sm font-medium text-neutral hover:text-primary transition-colors px-4`
- Get Started: `bg-tertiary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-tertiary/25 hover:opacity-90 transition-opacity`

**Mobile**: hamburger menu → slide-down drawer with all links + CTA

---

## Section 1 — Hero ✅ DONE

Already built in `components/landing/HeroSection.tsx`.
Do not rebuild. Import as-is.

---

## Section 2 — Problem Statement — `components/landing/ProblemSection.tsx`

**Background**: `bg-white`
**Goal**: Make visitor say "yeh toh meri problem hai"

**Layout**: Centered, max-w-3xl mx-auto, text-center

**Top label**:
```
[ ● The Problem ]
```
- `inline-flex items-center gap-2 bg-tertiary/10 border border-tertiary/25 text-tertiary text-xs px-3.5 py-1.5 rounded-full font-semibold`

**Headline** (below label, mt-4):
```
Managing clients shouldn't
feel like chaos
```
- `font-display font-bold text-primary leading-tight`
- Size: `text-4xl lg:text-5xl`
- "chaos" → `text-tertiary`

**Subtext** (mt-4, max-w-xl mx-auto):
```
Freelancers and agency owners lose deals every week —
not because of bad work, but because of scattered tools,
missed follow-ups, and zero visibility into their pipeline.
```
- `text-neutral text-base lg:text-lg leading-relaxed`

**3 Pain Point Cards** (mt-12, grid grid-cols-1 md:grid-cols-3 gap-4):

Card 1:
```
icon: 📋 (or ti-notes icon)
title: "Leads Fall Through Cracks"
desc: "You send a proposal and forget to follow up. The client moves on."
```

Card 2:
```
icon: 🔔 (or ti-bell-off)
title: "Missed Follow-Ups"
desc: "No reminder system. You remember on day 5, but the moment has passed."
```

Card 3:
```
icon: 📊 (or ti-chart-off)
title: "No Revenue Visibility"
desc: "You have no idea which platform or client is actually making you money."
```

**Card styling**:
```
bg-neutral-light border border-neutral/10 rounded-2xl p-6
icon: w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-4
title: font-display font-bold text-primary text-base mb-2
desc: text-neutral text-sm leading-relaxed
```

---

## Section 3 — Features — `components/landing/FeaturesSection.tsx`

**Background**: `bg-primary` (dark green)
**Goal**: Show all 6 modules clearly

**Top label**:
```
[ ✦ Everything You Need ]
```
- `bg-secondary/10 border border-secondary/25 text-secondary` — same pill pattern

**Headline**:
```
One platform.
All your deals.
```
- `font-display font-bold text-white`
- Size: `text-4xl lg:text-5xl`
- "deals." → `text-secondary`

**Subtext**:
```
From first lead to final payment — Dealflow keeps
your entire business pipeline in one place.
```
- `text-white/60 text-base lg:text-lg`

**6 Feature Cards** (mt-12, grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4):

| # | Icon (Tabler) | Title | Description |
|---|---|---|---|
| 1 | `ti-filter` | Leads Tracker | Track every lead from first contact to closed deal. Kanban + table view. |
| 2 | `ti-users` | Client Management | Full client profiles, order history, notes, and tags in one place. |
| 3 | `ti-bell` | Auto Reminders | 48hr no-reply? We flag it. Email alerts so you never miss a follow-up. |
| 4 | `ti-currency-dollar` | Revenue Tracking | Multi-currency revenue with live exchange rates. PKR, USD, AED and more. |
| 5 | `ti-chart-bar` | Analytics | Conversion rates, best platforms, team performance. Know what's working. |
| 6 | `ti-building` | Team Workspace | Invite your team. Assign leads. Role-based access for Owner, Manager, Employee. |

**Card styling**:
```
background: rgba(255,255,255,0.05)
border: 1px solid rgba(255,255,255,0.08)
border-radius: rounded-2xl
padding: p-6
hover: bg-white/10 transition-colors duration-200

icon wrapper: w-11 h-11 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center mb-4
icon size: text-xl (Tabler icon)
title: font-display font-bold text-white text-base mb-2
desc: text-white/55 text-sm leading-relaxed
```

---

## Section 4 — How It Works — `components/landing/HowItWorksSection.tsx`

**Background**: `bg-white`
**Goal**: Show simplicity — 3 steps only

**Top label**: `[ → How It Works ]` — same pill, `bg-secondary/10 text-primary border-secondary/25`

**Headline**:
```
Up and running
in minutes
```
- `font-display font-bold text-primary text-4xl lg:text-5xl`
- "minutes" → `text-secondary`

**3 Steps** (mt-14, flex flex-col lg:flex-row gap-0 lg:gap-0, connected by line):

Layout: horizontal on desktop, vertical on mobile.
Between steps: dashed line `border-dashed border-t-2 border-secondary/30` on desktop, `border-l-2` on mobile.

Step 1:
```
number: "01" — font-display font-bold text-6xl text-secondary/20
title: "Add Your Leads"
desc: "Log every outreach — platform, contact, proposed amount. Takes 30 seconds."
icon: ti-plus-circle  (big, 48px, text-secondary)
```

Step 2:
```
number: "02"
title: "Track & Follow Up"
desc: "Watch leads move through your pipeline. Get auto-alerts if no reply in 48 hours."
icon: ti-activity
```

Step 3:
```
number: "03"
title: "Convert & Grow"
desc: "One click to convert a lead into a client. Watch your revenue grow in real-time."
icon: ti-trending-up
```

**Step card styling**:
```
flex-1 text-center px-8 py-10
number: absolute or decorative, text-8xl font-display font-bold text-secondary/10 select-none
icon wrapper: w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 text-secondary text-2xl
title: font-display font-bold text-primary text-xl mb-3
desc: text-neutral text-sm leading-relaxed max-w-xs mx-auto
```

---

## Section 5 — Stats Band — `components/landing/StatsBandSection.tsx`

**Background**: `bg-primary` (dark green, full width)
**Goal**: Trust through numbers

**Layout**: Single row, `flex flex-col sm:flex-row items-center justify-center gap-12 lg:gap-24 py-16`

**3 Stats**:

| Number | Label |
|---|---|
| 500+ | Teams using Dealflow |
| $12M+ | Revenue tracked |
| 10,000+ | Leads managed |

**Styling per stat**:
```
text-center
number: font-display font-bold text-secondary text-5xl lg:text-6xl
label: text-white/50 text-sm mt-2 font-medium
```

**Dividers between stats** (desktop only):
```
w-px h-12 bg-white/10
```

---

## Section 6 — Leads Showcase — `components/landing/LeadsShowcaseSection.tsx`

**Background**: `bg-neutral-light`
**Goal**: Show the CORE feature — leads tracking — with real UI preview

**Layout**: Split — `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`

**Left side — Feature bullets**:

Top label: `[ ⚡ Lead Tracking ]` pill — `bg-secondary/10 text-primary border-secondary/25`

Headline:
```
Never lose a
lead again
```
- `font-display font-bold text-primary text-4xl lg:text-5xl`
- "lead" → underline with `text-secondary`

Subtext:
```
Every outreach tracked. Every follow-up flagged.
Every conversion recorded. Your pipeline, finally under control.
```

**4 Feature bullets** (mt-8, space-y-4):
```
✦  Kanban + table view — switch anytime
✦  48hr auto follow-up alerts via email
✦  Track by platform — Upwork, Fiverr, LinkedIn, Direct
✦  Lost reason tracking — know why deals fall through
```
- Bullet: `w-6 h-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-xs flex-shrink-0`
- Text: `text-primary text-sm font-medium`

CTA below bullets:
```
[ Start Tracking Leads → ]
```
- `bg-primary text-secondary font-semibold text-sm px-6 py-3 rounded-full hover:bg-primary/90 transition-opacity`

**Right side — UI Mockup card**:

Dark card (`bg-primary rounded-2xl p-5 shadow-2xl`):

```
Header row:
  "Lead Pipeline"  |  [ + Add Lead ]
  text-white font-display font-bold text-sm  |  bg-secondary/15 text-secondary text-xs px-3 py-1 rounded-full

Stats row (mt-4, grid grid-cols-3 gap-3):
  [ Sent: 48 ]  [ Replied: 23 ]  [ Converted: 12 ]
  bg-white/5 rounded-xl p-3
  number: text-secondary font-bold font-display text-xl
  label: text-white/40 text-[10px] mt-1

Lead list (mt-4, space-y-2.5):
  3 lead rows, each:
  ┌─────────────────────────────────────────────┐
  │ ● Ahmad Khan          Upwork    $1,200  [Pending]  │
  │ ● Sara Ltd            LinkedIn  $3,500  [Replied]  │
  │ ● TechStart           Direct    $800    [Follow-up]│
  └─────────────────────────────────────────────┘

  Row styling:
  flex items-center justify-between bg-white/5 rounded-xl px-4 py-3
  
  Status badge colors:
  Pending:    bg-yellow-500/20 text-yellow-400
  Replied:    bg-secondary/20 text-secondary
  Follow-up:  bg-tertiary/20 text-tertiary
  Converted:  bg-secondary/30 text-secondary font-bold

  Platform tags (small pill):
  Upwork:   bg-green-900/50 text-green-400
  LinkedIn: bg-blue-900/50 text-blue-400
  Direct:   bg-white/10 text-white/50

Follow-up alert banner (mt-4):
  bg-tertiary/15 border border-tertiary/25 rounded-xl px-4 py-3
  flex items-center gap-3
  icon: ti-bell text-tertiary
  text: "3 leads need follow-up today" text-white/80 text-xs
  button: "View all →" text-tertiary text-xs font-semibold
```

---

## Section 7 — Pricing — `components/landing/PricingSection.tsx`

**Background**: `bg-white`
**Goal**: Simple decision — Free vs Pro

**Top label**: `[ 💳 Pricing ]` — same pill pattern

**Headline**:
```
Simple, transparent
pricing
```
- "transparent" → `text-secondary`

**Toggle** (Monthly / Yearly — save 20%):
```
flex items-center gap-3 mt-6
[ Monthly ]  ●───  [ Yearly  -20% ]
toggle: w-12 h-6 bg-secondary rounded-full cursor-pointer
```

**2 Plan Cards** (mt-10, grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto):

**Free Plan**:
```
bg-neutral-light border border-neutral/10 rounded-2xl p-8

Header:
  "Free" — font-display font-bold text-primary text-2xl
  "For solo freelancers" — text-neutral text-sm mt-1

Price:
  "$0" — font-display font-bold text-primary text-5xl mt-6
  "/month" — text-neutral text-sm

Feature list (mt-6 space-y-3):
  ✓  Up to 50 leads/month
  ✓  1 workspace
  ✓  Client management
  ✓  Email reminders
  ✗  Team members  (text-neutral/40, strike or muted)
  ✗  Analytics
  ✗  Revenue tracking

CTA:
  "Get Started Free" — full width, bg-primary text-secondary font-semibold py-3.5 rounded-full mt-8
```

**Pro Plan** (featured):
```
bg-primary border-2 border-secondary rounded-2xl p-8 relative

Badge (top-right absolute):
  "Most Popular" — bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full

Header:
  "Pro" — font-display font-bold text-white text-2xl
  "For agencies & teams" — text-white/50 text-sm mt-1

Price:
  "$19" — font-display font-bold text-secondary text-5xl mt-6
  "/month" — text-white/40 text-sm

Feature list (mt-6 space-y-3):
  ✓  Unlimited leads
  ✓  Multiple workspaces
  ✓  Client management
  ✓  Email reminders
  ✓  Up to 10 team members
  ✓  Full analytics
  ✓  Revenue tracking + export

  checkmark icon: text-secondary
  text: text-white/80 text-sm

CTA:
  "Start Pro Trial" — full width, bg-secondary text-primary font-bold py-3.5 rounded-full mt-8 hover:opacity-90
```

---

## Section 8 — Final CTA Banner — `components/landing/CTASection.tsx`

**Background**: `bg-primary`
**Goal**: Last conversion push before footer

**Layout**: Centered, `py-24`

**Decorative**: Large faint rings behind text (same as hero):
```
absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full border border-white/5 translate-x-1/3 translate-y-1/3
absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full border border-white/5 translate-x-1/3 translate-y-1/3
```

**Content** (relative z-10, text-center):

Small label:
```
"✦ Start for free today"
bg-secondary/10 border border-secondary/20 text-secondary text-xs px-4 py-1.5 rounded-full
```

Headline (mt-5):
```
Ready to close
more deals?
```
- `font-display font-bold text-white text-4xl lg:text-6xl leading-tight`
- "deals?" → `text-secondary`

Subtext (mt-4):
```
Join 500+ freelancers and agencies already using Dealflow
to track leads, manage clients, and grow revenue.
```
- `text-white/50 text-base max-w-md mx-auto`

Buttons (mt-8, flex gap-4 justify-center flex-wrap):
```
[ Get Started Free → ]    [ Watch Demo ]
```
- Primary: `bg-secondary text-primary font-bold px-8 py-4 rounded-full text-sm shadow-lg shadow-secondary/20 hover:opacity-90`
- Secondary: `text-white/60 text-sm font-medium hover:text-white transition-colors px-4 py-4`

Small trust note (mt-6):
```
"No credit card required · Free forever plan · Setup in 2 minutes"
text-white/30 text-xs
```

---

## Section 9 — Footer — `components/landing/Footer.tsx`

**Background**: `bg-primary border-t border-white/5`

**Layout**: `max-w-7xl mx-auto px-6 lg:px-12 py-12`

**Top row** (`flex flex-col md:flex-row justify-between gap-8`):

**Left — Brand**:
```
Logo (same as navbar)
Tagline: "Your deals. Your clients. Under control."
text-white/40 text-sm mt-2
```

**Right — Link columns** (flex gap-12):

```
Product          Company
────────         ────────
Features         About
Pricing          Blog
How It Works     Careers
Changelog        Contact
```
- Column title: `text-white/30 text-xs font-semibold uppercase tracking-wider mb-4`
- Links: `text-white/50 text-sm hover:text-white transition-colors block mb-3`

**Bottom row** (mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4):
```
Left:  "© 2026 Dealflow. All rights reserved."
       text-white/25 text-xs

Right: Privacy Policy  ·  Terms of Service
       text-white/25 text-xs hover:text-white/50
```

---

## Scroll Animation (apply globally)

Use Intersection Observer or Tailwind `animate-` for fade-in on scroll:

```tsx
// Simple pattern — add to section wrappers
className="opacity-0 translate-y-4 transition-all duration-700 [&.visible]:opacity-100 [&.visible]:translate-y-0"

// Add class via useEffect + IntersectionObserver
// OR use a simple custom hook: useScrollReveal()
```

Apply to: feature cards, step cards, stat numbers, pricing cards.
Do NOT animate: navbar, hero (already visible), footer.

---

## page.tsx — Final Assembly

```tsx
// app/page.tsx
import Navbar               from "@/components/landing/Navbar"
import HeroSection          from "@/components/landing/HeroSection"
import ProblemSection       from "@/components/landing/ProblemSection"
import FeaturesSection      from "@/components/landing/FeaturesSection"
import HowItWorksSection    from "@/components/landing/HowItWorksSection"
import StatsBandSection     from "@/components/landing/StatsBandSection"
import LeadsShowcaseSection from "@/components/landing/LeadsShowcaseSection"
import PricingSection       from "@/components/landing/PricingSection"
import CTASection           from "@/components/landing/CTASection"
import Footer               from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsBandSection />
      <LeadsShowcaseSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
```

---

## Component File Checklist

| Component | File | Status |
|---|---|---|
| Navbar | `components/landing/Navbar.tsx` | ⏳ |
| HeroSection | `components/landing/HeroSection.tsx` | ✅ Done |
| ProblemSection | `components/landing/ProblemSection.tsx` | ⏳ |
| FeaturesSection | `components/landing/FeaturesSection.tsx` | ⏳ |
| HowItWorksSection | `components/landing/HowItWorksSection.tsx` | ⏳ |
| StatsBandSection | `components/landing/StatsBandSection.tsx` | ⏳ |
| LeadsShowcaseSection | `components/landing/LeadsShowcaseSection.tsx` | ⏳ |
| PricingSection | `components/landing/PricingSection.tsx` | ⏳ |
| CTASection | `components/landing/CTASection.tsx` | ⏳ |
| Footer | `components/landing/Footer.tsx` | ⏳ |

---

## Claude Code Instructions

When building any landing section:

1. **Read CLAUDE.md first** — color tokens, conventions, folder structure
2. **Read this file** — exact layout and content spec for that section
3. **Match hero section patterns** — glassmorphism, opacity variants, font-display
4. **Tailwind only** — no custom CSS files, no CSS modules
5. **Inline style only for**: `clamp()`, `radial-gradient`, specific transforms, `backdropFilter`
6. **Use Tabler icons** — `import { IconName } from "@tabler/icons-react"` or inline SVGs like hero
7. **Keep each file under 150 lines** — extract sub-components at bottom of same file if needed
8. **No placeholder lorem ipsum** — use real CRM-relevant content as specified above
9. **Match background alternation**: white → dark → white → dark → light → white → dark → dark
10. **Test responsive**: 375px mobile and 1280px desktop must both look correct