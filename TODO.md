# Cozia — Build Plan (Phase 0 → Completion)

Solo build. Each phase should leave you with something demoable, not just "code that compiles."

---

## Phase 0 — Foundations & Setup

**Goal:** Repo exists, tooling works, accounts are provisioned. Nothing user-facing yet.

- [ ] Register domain (check `cozia.app`, `cozia.io`, `getcozia.com`, `usecozia.com` availability)
- [ ] Reserve social handles (@cozia or closest available across platforms you care about)
- [ ] Create GitHub repo (monorepo: `apps/web`, `apps/api`, `docs/`, `infra/`)
- [ ] Set up Supabase project (dev + prod environments)
- [ ] Set up YouTube Data API v3 credentials (Google Cloud project, API key, quota check)
- [ ] Set up Redis instance (local for dev; hosted — e.g. Upstash/Railway — for prod)
- [ ] Scaffold `apps/web`: Vite + React + TypeScript + Tailwind + shadcn/ui
- [ ] Scaffold `apps/api`: FastAPI + basic health-check endpoint
- [ ] Set up ARQ worker skeleton (connected to Redis, no real jobs yet)
- [ ] CI: basic GitHub Actions (lint + typecheck on push)
- [ ] `.env.example` files for both apps, secrets management plan (never commit keys)
- [ ] Write `DECISIONS.md` and log the decisions made so far (name, layout direction, stack)

**Done when:** `npm run dev` boots the frontend, `uvicorn` boots the backend, both talk to a dev Supabase instance, and a "Hello Cozia" page renders.

---

## Phase 1 — Data Model & Auth

**Goal:** Users can sign up/log in. Core tables exist.

- [ ] Supabase Auth wired into frontend (sign up, log in, log out, session persistence)
- [ ] Postgres schema migration: `users` (profile extension), `curated_videos`, `rows`, `follows`, `posts`, `comments`, `reactions`, `moderation_queue`
- [ ] Row-level security (RLS) policies in Supabase for each table
- [ ] FastAPI JWT verification middleware (validates Supabase Auth tokens on protected routes)
- [ ] Basic profile page (view/edit display name, avatar)
- [ ] Decide + implement: single-user accounts vs. household/multi-profile from the start (see Architecture open question)

**Done when:** A real user can sign up, log in, see their profile, and their session persists across reloads.

---

## Phase 2 — YouTube Integration (Backend)

**Goal:** Backend can fetch, cache, and serve YouTube video metadata.

- [ ] FastAPI service layer wrapping YouTube Data API v3 (search, video details, channel details)
- [ ] Redis caching layer for YouTube responses (TTL-based)
- [ ] ARQ background job: periodic refresh of cached metadata for curated videos
- [ ] `curated_videos` admin flow (even if just a script or basic internal endpoint for now, since you're the only curator) — add a YouTube video by ID/URL, tag category, set safety_status
- [ ] Quota monitoring/logging — know how close you are to YouTube API daily limits

**Done when:** You can add a YouTube video ID via an internal tool/script and have its metadata cached and retrievable via your own API.

---

## Phase 3 — Landing / Browse Page (Netflix-style UI)

**Goal:** The "clone both landing pages, but better" milestone — this is the centerpiece deliverable.

- [ ] Hero banner component (featured video/collection, auto-rotate or manually curated)
- [ ] Horizontal scrolling row component (reusable — "shelf" component)
- [ ] Row data wired to real `rows`/`curated_videos` data from backend (not mock data)
- [ ] Video card component (thumbnail, title, duration, hover preview if feasible)
- [ ] Category rows (Family Picks, Trending Shorts, New This Week, etc.)
- [ ] Responsive layout — mobile-first pass (both YouTube and Netflix are majority-mobile usage)
- [ ] Design tokens applied (color, type, spacing per DESIGN.md) — this is where "better than both" needs to actually show up visually
- [ ] Loading states, empty states (what shows before any content is curated)

**Done when:** You can load the browse page, see real curated YouTube content in a Netflix-style hero+rows layout, and it feels like a distinct, polished product — not a rough clone.

---

## Phase 4 — Video Playback

**Goal:** Clicking a video actually plays it, wrapped in Cozia's UI.

- [ ] Video detail/player route
- [ ] YouTube IFrame Player API integration
- [ ] Player chrome: title, description, category tags below player
- [ ] "Related" row (same category/tags) below player
- [ ] Playback analytics (basic: what got watched, for future curation/ranking — respecting privacy)

**Done when:** End-to-end flow works: browse → click video → watch it via embedded YouTube player inside Cozia's UI.

---

## Phase 5 — Social Layer (Core)

**Goal:** Posts, comments, reactions, follows — Cozia stops being "just a YouTube front-end."

- [ ] Follow/unfollow users
- [ ] Post creation (standalone, or attached to a curated video)
- [ ] Comments (on posts and/or videos)
- [ ] Reactions (on posts, comments, videos)
- [ ] Social feed page (posts from people you follow)
- [ ] "Popular in your community" row wired into browse page (real differentiation vs. Netflix/YouTube)

**Done when:** A user can follow another user, post something, comment/react, and see a real feed — the social loop is closed.

---

## Phase 6 — Moderation & Safety

**Goal:** The "family-safe" promise is actually enforced, not just implied by design.

- [ ] Moderation queue UI (approve/reject curated videos and flagged UGC)
- [ ] Basic auto-flagging for UGC (keyword/profanity filter to start)
- [ ] Safety-status enforcement — unapproved videos never appear on public rows
- [ ] Reporting flow (users can report a post/comment/video)
- [ ] Audit log of moderation actions (even solo — useful for consistency and future team handoff)

**Done when:** Nothing reaches the public browse page or feed without passing through the safety_status/moderation gate, and you have a working process to review flagged content in under a few minutes a day.

---

## Phase 7 — Polish & Performance

**Goal:** Feels like a real product, not a prototype.

- [ ] Performance pass (Lighthouse audit, image/thumbnail lazy loading, row virtualization if needed)
- [ ] Empty/error states across the whole app (not just browse page)
- [ ] Accessibility pass (keyboard nav for rows/player, alt text, contrast)
- [ ] Cross-browser/device QA
- [ ] SEO basics for the public-facing landing page (pre-login)
- [ ] Analytics wired (privacy-respecting — page views, watch starts, engagement)

**Done when:** You'd be comfortable sending this to a stranger without a disclaimer.

---

## Phase 8 — Launch Prep

**Goal:** Ready for real users.

- [ ] Production Supabase + Redis + hosting finalized (pick hosting: e.g. Vercel/Netlify for web, Railway/Fly.io/Render for API+worker)
- [ ] Domain live, SSL configured
- [ ] Terms of Service / Privacy Policy (basic, given social + minors-adjacent audience — worth being careful here)
- [ ] Backup/recovery plan for Supabase data
- [ ] Monitoring/alerting (uptime, error tracking — e.g. Sentry)
- [ ] Seed content: enough curated videos and rows that the app doesn't look empty on day one
- [ ] Soft launch plan (invite-only or small audience first)

**Done when:** Cozia is live, monitored, and has enough content to not feel empty to a first-time visitor.

---

## Phase 9 — Post-Launch / Growth (Backlog, not blocking launch)

- [ ] Household/multi-profile accounts (if deferred from Phase 1)
- [ ] Push notifications (new content, social activity)
- [ ] Creator tools (your originally-scoped #1 pillar alongside video — revisit once social+video loop is proven)
- [ ] Real-time "friends watching now" (Supabase Realtime)
- [ ] Recommendation/ranking beyond manual curation (as data volume justifies it)
- [ ] Consider original/hosted video (major scope shift — only if YouTube-sourced model proves the concept and you want to reduce dependency on YouTube's platform)
- [ ] Mobile app (React Native) if web traction justifies it

---

## Notes

- **Quota risk:** YouTube Data API quota is the single biggest technical risk to watch early — design caching (Phase 2) before you're tempted to skip it.
- **Legal risk:** family-friendly + social + video touching minors-adjacent audiences means Terms/Privacy (Phase 8) shouldn't be an afterthought — revisit earlier if the user base skews young.
- **Scope discipline:** Phases 0–6 are the real MVP. Phase 7–8 is what makes it launch-worthy. Phase 9 is explicitly backlog — resist pulling items forward until the core loop (browse → watch → engage socially, safely) is solid.