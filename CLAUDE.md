# Dealflow

Multi-tenant SaaS CRM for freelancers and agency owners — leads → follow-ups → clients → revenue.

**Full project context, architecture, data model, API surface, conventions and known gaps live in
[`.claude/CLAUDE.md`](.claude/CLAUDE.md). Read that before changing anything.**

Quick facts (details in that file):

- Next.js 16 App Router + React 19 + TypeScript strict. All backend is in `src/app/api/**` —
  there is no separate Express server.
- Auth: Clerk. `src/proxy.ts` is the middleware (Next 16 rename). Mongo `User.clerkId` is the join key.
- DB: MongoDB + Mongoose. Every document is scoped by `workspaceId` — always filter by it.
- Data layer: Zustand stores calling `fetch("/api/...")`. No TanStack Query, no axios.
- Styling: Tailwind v4, tokens in `src/app/globals.css` under `@theme`. No `tailwind.config.js`.
- API routes use `withAuth(handler, minRole?)` from `src/lib/withAuth.ts` + Zod body validation.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```
