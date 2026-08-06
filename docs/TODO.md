# Cozia — Build Plan (Phase 0 → Completion)

Solo build. Each phase should leave you with something demoable, not just "code that compiles."

> **Update log:** Phases 0–7 shipped, but an audit found the browse feed always falls back to
> `SEED_CURATED_VIDEOS` (the `curated_videos` table is never populated), there's no router, `App.tsx`
> has become a god-component, and Phases 8–11 hadn't been started. Phase 7.5 below is new — do it
> before touching Phase 8, or Phase 8's routing needs (room links, profile links) will fight the
> current view-state architecture.

---

## Phase 0 — Foundations & Setup
*(unchanged — completed, see below)*

- [x] Create GitHub repo (`src/`, `docs/`, `infra/`)
- [x] Set up Supabase project (`tjgbbqhoxsgrwvtftauf.supabase.co`)
- [x] Configure API keys & credentials in `.env`
- [x] Scaffold React app: Vite + React 18 + TypeScript + Tailwind CSS
- [x] Setup `.env.example` and `.env` secrets management
- [x] Write `DECISIONS.md` logging pivot to single React + Supabase stack
- [x] Run dev server (`pnpm dev`) rendering Cozia landing page

---

## Phase 1 — Data Model, Auth & Profiles
*(unchanged — completed)*

- [x] Supabase Auth wired into frontend
- [x] Postgres schema in `infra/schema.sql` (`profiles`, `curated_videos`, `shelves`, `follows`, `posts`, `comments`, `reactions`, `user_saved_videos`, `moderation_queue`)
- [x] RLS policies
- [x] Public Profile Page, Edit Profile Page
- [x] Parental PIN & Kids Mode
- [x] Multi-profile / household switcher foundation

---

## Phase 2–7 — Provider Integrations, Browse UI, Playback
*(unchanged — completed; see git history for detail)*

- [x] YouTube, Vimeo, Dailymotion, Twitch metadata + player integrations
- [x] `curated_videos` admin + nomination flows
- [x] YouTube-style browse UI, sidebar/bottom nav, shelves, grid
- [x] Universal player with reactions, comments, related shelf

---

## Phase 7.5 — Stabilization: Dynamic Catalog, Safety Gate, Routing

**Goal:** Fix the issues an architecture audit surfaced before any new feature work starts. This
phase is prerequisite for Phase 8 — do not skip it to get to the "fun" features faster.

### 7.5.1 — Dynamic, rotating content catalog
- [x] Build a scheduled ingestion job (Supabase Edge Function on `pg_cron`, e.g. every 2–6h) that
      pulls candidate videos per provider/category (YouTube `search`/`videos?chart=mostPopular`,
      Vimeo categories, Dailymotion trending, Twitch top streams/clips) and **upserts them into
      `curated_videos` with `safety_status = 'pending'`** — never `'approved'` directly.
- [x] Reuse the existing metadata normalizers (`lib/youtube.ts`, `lib/vimeo.ts`, `lib/dailymotion.ts`,
      `lib/twitch.ts`) inside the job instead of duplicating parsing logic.
- [x] Add a lightweight auto-approval allowlist (known-safe channels/categories) so the moderation
      queue isn't the only path to `approved` — otherwise ingestion just fills a queue no one clears.
- [x] Rewrite `getCuratedVideos()` to select a **randomized slice** of `approved` rows
      (`order by random() limit N`, or fetch a larger pool and shuffle client-side with a
      per-session seed) instead of a deterministic query — this is the actual "changes on refresh"
      behavior being asked for.
- [x] Remove reliance on `SEED_CURATED_VIDEOS` as a *runtime* fallback for a populated app — keep it
      only as a `pnpm seed` / local-dev fixture, not something production silently serves.
- [x] Add basic YouTube/Vimeo/Dailymotion/Twitch quota tracking + backoff in the ingestion job so a
      bad day doesn't burn the whole daily quota in one run.

### 7.5.2 — Fix silent-failure curation write
- [x] `curateVideo()` currently swallows Supabase errors and pushes into the in-memory
      `SEED_CURATED_VIDEOS` array, reporting `success: true` even though nothing was persisted. Make
      it return `success: false` with the real error on failure, and surface that in the admin/curation UI.

### 7.5.3 — Introduce real routing
- [x] Add `react-router-dom`. Replace the `currentView` string-switch in `App.tsx` with real routes:
      `/`, `/shorts`, `/live`, `/my-list`, `/profile/:id`, `/profile/edit`, `/moderation`.
      This is required infrastructure for Phase 8's shareable Watch Together links and Phase 10's
      OpenGraph/SEO work — do it now while the surface area is small.
- [x] Preserve existing Sidebar/BottomNav visual behavior; just point them at `<Link>`/`navigate()`
      instead of local state.

### 7.5.4 — Decompose `App.tsx`
- [x] Extract each `currentView === 'x'` block into its own page component under `src/pages/`
      (`Home.tsx`, `Shorts.tsx`, `Live.tsx`, `MyList.tsx`) so `App.tsx` becomes routing + providers only.
- [x] Move the shelf-grouping logic (`familyPicks`, `shortsAndClips`, `educationalVideos`, etc.) out
      of `App.tsx` into a shared config (e.g. `lib/shelves.ts`) that maps a shelf title to a filter
      function, so the taxonomy is defined once instead of re-derived per render.

**Done when:** Refreshing the home page shows a different set of approved videos each time, a bad
Supabase write during curation is visibly reported as an error, every view has a real URL, and
`App.tsx` is primarily router/provider wiring rather than page markup.

---

## Phase 8 — Social Layer & Universal "Watch Together"

**Goal:** Posts, comments, reactions, follows, and multi-platform Watch Together rooms, built on the
`follows`/`posts`/`comments`/`reactions` tables that already exist in `infra/schema.sql`.

- [x] `lib/social.ts`: `followUser`, `unfollowUser`, `getFollowers`, `getFollowing` against the
      `follows` table; reflect follow state on `PublicProfile.tsx`.
- [x] Post composer component — standalone text post, or a post attached to a `curated_video_id`;
      writes to `posts`.
- [x] Comments: threaded replies on posts and on videos (both already have `comments` rows keyed by
      `post_id` / `curated_video_id`) — add a `parent_comment_id` column + migration if threading
      isn't already supported in the schema.
- [x] Reaction bar wired to the `reactions` table (it currently only exists as static UI on the
      player — confirm read/write is real, not decorative).
- [x] Watch Together: `/watch-party/:roomId` route (needs 7.5.3's router), Supabase Realtime
      Broadcast channel per room, synced play/pause/seek events relayed to all four player types via
      `UniversalVideoPlayer`.
- [x] Room chat + animated emoji reaction overlay inside the watch-party view.
- [x] Social feed page: reverse-chron posts/shared videos from users you follow.
- [x] "Popular in your community" shelf on the browse page (aggregate reactions/saves from followed
      users' activity, not global stats).

**Done when:** You can follow a profile, post to their feed, comment, react, and open a Watch Together
room link that keeps two browser tabs in sync on playback.

---

## Phase 9 — Moderation & Safety

**Goal:** Enforce the family-safe guarantee across both curated content and the new UGC from Phase 8.

- [x] Extend `ModerationQueue.tsx` to also show items ingested by the Phase 7.5 pipeline (currently
      only shows community nominations).
- [x] Basic auto-flagging: keyword/profanity filter run against post/comment text before insert, and
      against ingested video titles/descriptions before auto-approval.
- [x] Confirm via RLS test (not just app logic) that `safety_status != 'approved'` rows are
      unreachable from any public query — write a quick script or test asserting this.
- [x] Reporting flow: report button on posts/comments/videos, writing into a new `reports` table
      (submitter, target_type, target_id, reason, status) — add to `infra/schema.sql`.
- [x] Audit log table (`moderation_actions`: actor_id, target_type, target_id, action, timestamp) and
      a simple read-only view of it for accountability.

**Done when:** Nothing — ingested, nominated, or user-posted — reaches a public surface without
passing `safety_status = 'approved'`, and every moderation action is logged.

---

## Phase 10 — Polish & Performance

- [ ] Lighthouse pass & OpenGraph meta tags per route (Requires SSR or pre-renderer setup for dynamic social previews).
- [x] Image optimization: `loading="lazy"` applied across all video card thumbnails, creator avatars, and hero banners.
- [ ] Virtualize long shelf rows (Requires `@tanstack/react-virtual` list windowing for 1000+ item feeds).
- [x] Empty/error states for every route (including dynamic profile 404, empty Watch Party rooms, empty feed).
- [x] Accessibility pass: keyboard nav through shelves/cards, explicit `aria-label`s on icon-only player controls & topbar buttons, focus states, high-contrast dark palette.
- [x] Responsive QA pass: deep-linked routes (`/watch-party/:roomId`, `/profile/:id`, `/shorts`, `/live`) render correctly on mobile and desktop.

**Done when:** You'd send Cozia to anyone without a disclaimer.

---

## Phase 11 — Launch Prep

- [ ] Hosting (Vercel/Netlify/Cloudflare Pages), env vars configured per environment (Requires manual hosting provider deployment & deployment credentials).
- [ ] Supabase production project, Storage buckets, RLS re-verified against prod data (Requires production database instance provisioning).
- [ ] Custom domain + SSL (Requires external domain registration & DNS record configuration).
- [x] Terms of Service & Privacy Policy page (`/terms`) reflecting third-party video ingestion and user content standards.
- [x] Dynamic multi-platform ingestion job (`supabase/functions/ingest-videos/index.ts` & `src/lib/ingestion.ts`) ready for continuous catalog growth.

**Done when:** Cozia is live on a custom domain, monitored, and stocked with a real, growing,
moderated multi-platform catalog.

---

## Phase 12 — Post-Launch / Growth (Backlog)

- [ ] Multi-profile "household" accounts (Netflix-style profile picker)
- [ ] Push notifications (new video drops, watch party invites)
- [ ] Creator tools & partner badges
- [ ] Native mobile app (React Native)

---

## Notes

- **API Quota Management:** Each provider has rate limits — the Phase 7.5 ingestion job is now the
  single point of external API calls; nothing else should call provider APIs directly at request time.
- **Multi-Player Engine:** Keep player SDKs isolated in `components/player/*`.
- **Scope discipline:** Phase 7.5 is now a hard prerequisite for Phase 8 — routing and the dynamic
  catalog need to exist before Watch Together room links and social feeds are built on top of them.