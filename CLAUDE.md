# Dealflow — Claude Code Project Context

## What is Dealflow?
A full-stack SaaS CRM web app for freelancers and agency owners.
Centralizes client tracking, orders, leads, follow-ups, team management, and revenue in one platform.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (utility-first, no CSS modules)
- **State (UI)**: Zustand — sidebar, active workspace, current user, filters
- **State (Server)**: TanStack Query — all API calls, caching, refetching
- **Charts**: Recharts
- **HTTP**: Axios with interceptors

### Backend (separate repo/folder)
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication with refresh tokens
- Nodemailer + node-cron (email reminders)
- Open Exchange Rates API (live currency)

### Deployment
- Frontend: Vercel
- Backend: Render or Railway

---

## Color System (Tailwind custom tokens)

These are defined in tailwind.config and used throughout:

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0A2A22` | Dark green — backgrounds, text, navbar |
| `secondary` | `#4ADE80` | Bright green — CTAs, highlights, accents, active states |
| `tertiary` | `#F97316` | Orange — secondary CTAs, badges, stars |
| `neutral` | `#767776` | Muted text, labels, placeholders |
| `neutral-light` | (light gray) | Card backgrounds, phone status bars |

### Color Usage Rules
- NEVER use hardcoded hex in className — always use token names
- Exception: inline `style={{}}` props where Tailwind can't reach (e.g. gradients, radial backgrounds)
- Dark sections use `bg-primary` with `text-white` or `text-secondary`
- Accent dots, progress bars, active indicators → `bg-secondary`
- Warnings, badges, star ratings → `text-tertiary` / `bg-tertiary`

---

## Typography

```
font-display  → headings, bold UI numbers, card titles (Plus Jakarta Sans or similar)
font-sans     → body text, labels, descriptions (Inter)
```

### Heading Scale
- Hero H1: `clamp(2.8rem, 4.5vw, 4.2rem)` — set via inline style
- Section H2: `text-3xl` or `text-4xl` font-bold
- Card titles: `text-sm font-semibold font-display`
- Labels/meta: `text-xs text-neutral`

---

## Folder Structure

```
dealflow/
├── app/
│   ├── (auth)/                    # login, register — centered layout, no sidebar
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/               # all protected pages — sidebar + topbar layout
│   │   ├── layout.tsx             # Sidebar + Topbar wrapper
│   │   ├── dashboard/page.tsx
│   │   ├── clients/page.tsx
│   │   ├── clients/[clientId]/page.tsx
│   │   ├── leads/page.tsx
│   │   ├── leads/[leadId]/page.tsx
│   │   ├── reminders/page.tsx
│   │   ├── revenue/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── team/page.tsx
│   │   └── settings/page.tsx
│   ├── workspace-setup/page.tsx   # one-time after register
│   ├── middleware.ts              # JWT auth guard — root level
│   ├── layout.tsx                 # root — providers wrap
│   ├── globals.css
│   └── page.tsx                   # landing page — imports only, no JSX logic
│
├── components/
│   ├── landing/                   # landing page sections
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx        ✅ DONE
│   │   ├── FeaturesSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── PricingSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── Footer.tsx
│   ├── layout/                    # app shell
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── MobileSidebar.tsx
│   ├── ui/                        # reusable primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   └── Table.tsx
│   ├── leads/
│   │   ├── LeadCard.tsx
│   │   ├── LeadKanban.tsx
│   │   ├── LeadTable.tsx
│   │   ├── LeadStatusBadge.tsx
│   │   └── AddLeadModal.tsx
│   ├── clients/
│   │   ├── ClientCard.tsx
│   │   ├── ClientTable.tsx
│   │   └── AddClientModal.tsx
│   └── dashboard/
│       ├── StatCard.tsx
│       ├── RevenueChart.tsx
│       └── ActivityFeed.tsx
│
├── hooks/                         # TanStack Query hooks
│   ├── useLeads.ts
│   ├── useClients.ts
│   ├── useAnalytics.ts
│   ├── useTeam.ts
│   └── useReminders.ts
│
├── store/                         # Zustand stores
│   ├── authStore.ts               # currentUser, token, role, isAuthenticated
│   ├── workspaceStore.ts          # workspaceId, workspaceName, members
│   └── uiStore.ts                 # sidebarOpen, activeFilters, notifCount, viewMode
│
├── lib/
│   ├── axios.ts                   # axios instance + interceptors (attach JWT)
│   ├── queryClient.ts             # TanStack Query setup
│   └── utils.ts                   # cn(), formatCurrency(), formatDate() etc
│
├── types/
│   ├── lead.ts
│   ├── client.ts
│   ├── user.ts
│   └── workspace.ts
│
├── services/                      # API call functions (used by hooks)
│   ├── leadService.ts
│   ├── clientService.ts
│   └── authService.ts
│
└── constants/
    ├── platforms.ts               # PLATFORMS: Upwork, Fiverr, LinkedIn, Direct, Referral
    ├── currencies.ts              # CURRENCIES: PKR, USD, EUR, GBP, AED
    └── leadStatuses.ts            # LEAD_STATUSES: Sent, Pending, FollowUp, Replied, Converted, Rejected
```

---

## Component Conventions (from HeroSection.tsx)

### File structure per component
```tsx
// 1. imports
// 2. local data/constants (arrays, objects used only in this file)
// 3. default export — main component
// 4. helper sub-components at bottom (e.g. CenterPhone, SidePhone)
```

### Styling patterns used
```tsx
// Responsive: mobile-first
className="text-center lg:text-left"
className="hidden lg:block"
className="flex flex-col lg:flex-row"

// Spacing pattern
className="pl-6 pr-6 md:pl-10 md:pr-8 lg:pl-16 lg:pr-12"

// Glassmorphism cards (used in hero bottom cards)
style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
className="border border-white/15 rounded-2xl"

// Inline style only for: clamp(), radial-gradient, specific px values, transform
style={{ fontSize: "clamp(2.8rem, 4.5vw, 4.2rem)" }}
style={{ background: "radial-gradient(...)" }}

// Decorative backgrounds
className="absolute bg-primary"  + skewY transform inline style

// Opacity variants
className="text-white/60"   // 60% opacity white
className="bg-secondary/10" // 10% opacity green
className="border-white/15" // 15% opacity white border
```

### Image imports
```tsx
import Image from "next/image"
import img1 from "./assests/image 1.jpg"  // note: assets folder is named "assests" (typo — keep consistent)
```

### Button patterns
```tsx
// Primary CTA (orange)
className="bg-tertiary text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-tertiary/30 hover:opacity-90 transition-opacity"

// Ghost/text button
className="text-sm text-neutral font-medium hover:text-primary transition-colors px-2"

// Icon button (active nav)
className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-secondary"

// Icon button (inactive nav)
className="w-9 h-9 rounded-xl flex items-center justify-center bg-neutral-light text-neutral"
```

### Badge/pill pattern
```tsx
className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/25 text-primary text-xs px-3.5 py-1.5 rounded-full font-semibold"
```

### Card patterns
```tsx
// Dark card (on dark bg)
className="bg-primary rounded-2xl p-3"

// Light card (on light bg)
className="bg-neutral-light rounded-xl p-2"

// Floating white card
className="bg-white rounded-2xl shadow-xl px-3 py-2.5"
```

---

## State Management Rules

| What | Tool | Store/Hook |
|---|---|---|
| Current user, token, role | Zustand | `authStore` |
| Active workspace | Zustand | `workspaceStore` |
| Sidebar open/close, view mode | Zustand | `uiStore` |
| Leads list, lead detail | TanStack Query | `useLeads`, `useClient` |
| Clients list, client detail | TanStack Query | `useClients`, `useClient` |
| Analytics data | TanStack Query | `useAnalytics` |
| Form input state | React `useState` | local only |

**Rule**: Never put server data in Zustand. Never put UI state in TanStack Query.

---

## Leads Module — Core Business Logic

### Lead lifecycle stages (pipeline)
```
Sent → Pending → Follow-up Due → Replied → Converted / Rejected
```

### Lead stats tracked
- Total sent, Replied count, Pending count, Converted count, Rejected count, Follow-up due count

### Auto follow-up rule
- If no reply in **48 hours** → status auto-changes to "Follow-up Due"
- Cron job runs daily → sends email to assignee
- In-app notification badge updates

### Lead fields
```ts
leadSentAt, repliedAt, status, followUpCount,
lastFollowUpAt, lostReason, convertedAt, assignedTo,
platform, proposedAmount, serviceOffered, notes
```

### Lost reason options
`budget_issue | no_fit | no_reply | went_with_competitor | project_cancelled | other`

---

## Workspace & Roles

- **Owner**: full access — billing, team, all data
- **Manager**: manage leads/clients, assign team, see revenue
- **Employee**: only see assigned leads/clients, no revenue, no team page

### Route access
- `/team` → Owner + Manager only
- `/revenue` → Owner + Manager only
- `/analytics` → Owner + Manager only
- `/settings` → Owner only (workspace config)

---

## Multi-currency Support

Supported: `PKR | USD | EUR | GBP | AED | CAD | AUD`
- Live rates via Open Exchange Rates API
- All amounts stored in original currency in DB
- Converted to user's preferred currency on display

---

## Lead Platforms (constants)

```ts
UPWORK | FIVERR | LINKEDIN | DIRECT | REFERRAL | WHATSAPP | OTHER
```

---

## Page → Component mapping (landing page)

`app/page.tsx` imports only — no JSX logic:
```tsx
<Navbar />
<HeroSection />      // ✅ DONE
<FeaturesSection />  // next
<StatsSection />
<HowItWorks />
<PricingSection />
<TestimonialsSection />
<Footer />
```

---

## Code Rules

1. **No file > 150 lines** — if it's getting long, extract sub-components
2. **page.tsx = imports only** — all logic in components
3. **No hardcoded strings** — use constants/ for platforms, currencies, statuses
4. **TypeScript strict** — no `any`, always type props explicitly
5. **Tailwind only** — no inline CSS except where Tailwind can't (clamp, radial-gradient, specific transforms)
6. **Sub-components at bottom** of same file if small and only used there (like CenterPhone, SidePhone)
7. **Named exports for types**, default exports for components
8. **Responsive always** — mobile-first, test at 375px and 1280px

---

## Assets

- Images stored in `app/assests/` (note the typo — keep consistent, don't rename)
- Use `next/image` for all images — never `<img>` tag
- Avatar images: `image 1.jpg`, `iamgew 2.jpg`, `iamge 3.jpg`, `iamge 4.jpg`

---

## Current Progress

| Area | Status |
|---|---|
| Next.js setup | ✅ Done |
| Landing — HeroSection | ✅ Done |
| Landing — Navbar | ⏳ Next |
| Landing — remaining sections | ⏳ Pending |
| Auth pages | ⏳ Pending |
| Dashboard layout (Sidebar + Topbar) | ⏳ Pending |
| All feature pages | ⏳ Pending |
| Backend | ⏳ Pending |