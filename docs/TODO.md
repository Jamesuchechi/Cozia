# Cozia — Build Plan (Phase 0 → Completion)

Solo build. Each phase should leave you with something demoable, not just "code that compiles."

---

## Phase 0 — Foundations & Setup

**Goal:** Repo exists, tooling works, Supabase is provisioned. Clean foundation ready.

- [x] Create GitHub repo (`src/`, `docs/`, `infra/`)
- [x] Set up Supabase project (`tjgbbqhoxsgrwvtftauf.supabase.co`)
- [x] Configure YouTube Data API v3 credentials in `.env`
- [x] Scaffold React app: Vite + React 18 + TypeScript + Tailwind CSS
- [x] Setup `.env.example` and `.env` secrets management
- [x] Write `DECISIONS.md` logging pivot to single React + Supabase stack
- [x] Run dev server (`pnpm dev`) rendering Cozia landing page

**Done when:** `pnpm dev` boots the frontend, connects to Supabase, and renders cleanly. *(Completed)*

---

## Phase 1 — Data Model & Auth

**Goal:** Users can sign up/log in using Supabase Auth. Core Postgres tables & RLS exist.

- [ ] Supabase Auth wired into frontend (sign up, log in, log out, session persistence)
- [ ] Postgres schema migration in Supabase: `users` (profile extension), `curated_videos`, `rows`, `follows`, `posts`, `comments`, `reactions`, `moderation_queue`, `user_saved_videos`
- [ ] Row-level security (RLS) policies in Supabase for each table
- [ ] Basic profile page (view/edit display name, avatar)
- [ ] Parental PIN & "Kids Mode" profile toggle (4-digit PIN protection locking settings & restricting feed to kids-approved content)
- [ ] Single-user account vs. household/multi-profile handling

**Done when:** A real user can sign up, log in, switch profiles with PIN protection, and their session persists across reloads.

---

## Phase 2 — YouTube Integration & Curation

**Goal:** Fetch and cache YouTube video metadata directly via YouTube Data API v3 & Supabase curation table.

- [ ] Client service / helper wrapping YouTube Data API v3 (search, video details, channel details)
- [ ] Caching layer for YouTube responses in Supabase `curated_videos` table to preserve quota
- [ ] `curated_videos` admin flow — add a YouTube video by ID/URL, tag category, set safety_status
- [ ] Community "Suggest a Video" nomination flow (users submit YouTube URLs into moderation queue with category & safety notes)
- [ ] Quota monitoring & client request throttling

**Done when:** You can add or nominate a YouTube video ID and have its metadata fetched and cached in Supabase.

---

## Phase 3 — Landing / Browse Page (Netflix-style UI)

**Goal:** The centerpiece deliverable — Netflix-style browse page with hero banner, horizontal rows, and My List.

- [ ] Hero banner component (featured video/collection, auto-rotate or manually curated)
- [ ] Horizontal scrolling row component (reusable "shelf" component)
- [ ] Row data wired to real `rows` / `curated_videos` data from Supabase
- [ ] Video card component (thumbnail, title, duration, hover preview)
- [ ] "+ My List" & custom playlist bookmarks (save curated videos to user/household personal shelf)
- [ ] Content safety tags & duration filter chips (< 10 mins, Shorts, Educational, Storytime, Music)
- [ ] Category rows (Family Picks, Trending Shorts, New This Week, etc.)
- [ ] Responsive layout — mobile-first pass
- [ ] Design tokens applied (color, type, spacing per DESIGN.md)
- [ ] Loading states and skeleton placeholders

**Done when:** You can load the browse page, see real curated YouTube content in a Netflix-style hero+rows layout, filter by duration/tags, add to My List, and it feels like a distinct, polished product.

---

## Phase 4 — Video Playback

**Goal:** Clicking a video opens the player wrapped in Cozia's custom UI.

- [ ] Video detail/player route
- [ ] YouTube IFrame Player API integration
- [ ] Player chrome: title, description, category tags below player
- [ ] "Related" row (same category/tags) below player
- [ ] Basic watch progress / analytics

**Done when:** End-to-end flow works: browse → click video → watch via embedded YouTube player inside Cozia's UI.

---

## Phase 5 — Social Layer & Watch Together (Core)

**Goal:** Posts, comments, reactions, follows, and real-time Watch Together rooms.

- [ ] Follow/unfollow users
- [ ] Post creation (standalone, or attached to a curated video)
- [ ] Comments (on posts and/or videos)
- [ ] Reactions (on posts, comments, videos)
- [ ] Social feed page (posts from people you follow)
- [ ] "Watch Together" sync rooms (Supabase Realtime Broadcast for synchronized YouTube playback + live emoji reactions)
- [ ] "Popular in your community" row wired into browse page

**Done when:** Users can watch videos synchronously with friends via a shareable room link, follow each other, post, and engage in the social feed.

---

## Phase 6 — Moderation & Safety

**Goal:** Enforce the "family-safe" guarantee via curation status and UGC filtering.

- [ ] Moderation queue UI (approve/reject curated videos, community nominations, and flagged UGC)
- [ ] Basic auto-flagging for UGC (keyword/profanity filter)
- [ ] Safety-status enforcement — unapproved videos never appear on public rows
- [ ] Reporting flow (users can report a post/comment/video)
- [ ] Audit log of moderation actions

**Done when:** Nothing reaches public browse rows without passing safety_status approval.

---

## Phase 7 — Polish & Performance

**Goal:** Deliver a state-of-the-art visual and responsive experience.

- [ ] Performance pass (Lighthouse audit, image lazy loading)
- [ ] Empty/error states across the whole app
- [ ] Accessibility pass (keyboard navigation, ARIA labels, contrast)
- [ ] Cross-browser/device QA
- [ ] SEO basics & OpenGraph tags for public page

**Done when:** You would be proud to send Cozia to anyone without disclaimer.

---

## Phase 8 — Launch Prep

**Goal:** Deployment & production readiness.

- [ ] Hosting configured (Vercel / Netlify / Cloudflare Pages)
- [ ] Supabase production environment & RLS verified
- [ ] Custom domain live with SSL
- [ ] Terms of Service & Privacy Policy
- [ ] Seed content populated

**Done when:** Cozia is live on custom domain, monitored, and stocked with curated content.

---

## Phase 9 — Post-Launch / Growth (Backlog)

- [ ] Multi-profile "household" accounts
- [ ] Push notifications
- [ ] Creator tools
- [ ] Native mobile app (React Native)

---

## Notes

- **Quota risk:** YouTube Data API quota is the primary external limit — cache metadata in Supabase `curated_videos`.
- **Scope discipline:** Phases 0–6 represent the core MVP. Phase 7–8 make it launch-worthy.