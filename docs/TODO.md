# Cozia — Build Plan (Phase 0 → Completion)

Solo build. Each phase should leave you with something demoable, not just "code that compiles."

---

## Phase 0 — Foundations & Setup

**Goal:** Repo exists, tooling works, Supabase is provisioned. Clean foundation ready.

- [x] Create GitHub repo (`src/`, `docs/`, `infra/`)
- [x] Set up Supabase project (`tjgbbqhoxsgrwvtftauf.supabase.co`)
- [x] Configure API keys & credentials in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_YOUTUBE_API_KEY`, etc.)
- [x] Scaffold React app: Vite + React 18 + TypeScript + Tailwind CSS
- [x] Setup `.env.example` and `.env` secrets management
- [x] Write `DECISIONS.md` logging pivot to single React + Supabase stack
- [x] Run dev server (`pnpm dev`) rendering Cozia landing page

**Done when:** `pnpm dev` boots the frontend, connects to Supabase, and renders cleanly. *(Completed)*

---

## Phase 1 — Data Model, Auth & Profiles

**Goal:** Users can sign up/log in using Supabase Auth. Public profiles & edit profile pages exist.

- [x] Supabase Auth wired into frontend (sign up, log in, log out, session persistence, OAuth providers)
- [x] Postgres schema migration script created in `infra/schema.sql`:
  - `users` / `profiles` (display_name, avatar_url, bio, social_links, role)
  - `curated_videos` (provider: youtube | vimeo | dailymotion | twitch, provider_video_id, title, description, thumbnail_url, duration, category, tags, safety_status)
  - `rows` / `shelves` (shelf title, order, filter_type, video_ids)
  - `follows` (follower_id, following_id)
  - `posts` (author_id, content, curated_video_id)
  - `comments` (author_id, post_id, curated_video_id, content)
  - `reactions` (user_id, target_type, target_id, emoji)
  - `user_saved_videos` (user_id, curated_video_id, saved_at)
  - `moderation_queue` (submitting_user_id, video_url, provider, safety_status, notes)
- [x] Row-level security (RLS) policies in Supabase for all tables
- [x] Public Profile Page (`/profile/:id`) — displays avatar, display name, bio, social links, activity feed, saved list, and followed users
- [x] Edit Profile Page (`/profile/edit`) — edit display name, bio, avatar upload, and social links
- [x] Parental PIN & "Kids Mode" profile toggle (4-digit PIN lock to protect settings & restrict feed to kids-approved content)
- [x] Multi-profile / Household account switcher foundation

**Done when:** A real user can sign up, log in, edit their profile with bio and avatar, view public profiles, switch profiles with PIN protection, and persist session across reloads. *(Completed)*

---

## Phase 2 — YouTube Integration & Curation

**Goal:** Fetch, cache, and curate YouTube video metadata (Shorts + Full Length).

- [x] Client service helper wrapping YouTube Data API v3 (URL parsing, video details, channel metadata, ISO 8601 duration formatter, oEmbed fallback)
- [x] YouTube IFrame Player API integration wrapper
- [x] Caching layer for YouTube metadata in Supabase `curated_videos` (`provider = 'youtube'`) with fallback seed dataset
- [x] `curated_videos` admin flow — add YouTube video by URL/ID, set category & safety_status
- [x] Community "Suggest a Video" nomination flow into `moderation_queue` ([src/components/curation/NominateModal.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/curation/NominateModal.tsx))
- [x] Moderation Queue dashboard view for 1-tap Approve & Publish ([src/pages/ModerationQueue.tsx](file:///home/jamesuchechi/Projects/Cozia/src/pages/ModerationQueue.tsx))
- [x] Quota monitoring & client request throttling

**Done when:** You can add or nominate a YouTube video ID and have its metadata fetched, cached in Supabase, and rendered. *(Completed)*

---

## Phase 3 — Vimeo Integration & Curation

**Goal:** Fetch, cache, and curate high-quality Vimeo video metadata (Indie films, Educational, Shorts).

- [x] Vimeo API (v3) & oEmbed integration ([src/lib/vimeo.ts](file:///home/jamesuchechi/Projects/Cozia/src/lib/vimeo.ts)) — fetch video metadata using `VITE_VIMEO_PERSONAL_ACCESS_TOKEN` / `VITE_VIMEO_CLIENT_ID` with oEmbed fallback
- [x] Vimeo Player iframe component ([src/components/player/VimeoPlayer.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/player/VimeoPlayer.tsx))
- [x] Caching layer for Vimeo metadata in Supabase `curated_videos` (`provider = 'vimeo'`)
- [x] Vimeo URL parser & validator (supports `vimeo.com/{id}` and channel URLs)
- [x] Community "Suggest a Vimeo Video" nomination flow in `NominateModal.tsx`

**Done when:** You can curate a Vimeo video URL, cache its metadata in Supabase, and play it seamlessly via the Vimeo Player. *(Completed)*

---

## Phase 4 — Dailymotion Integration & Curation

**Goal:** Fetch, cache, and curate Dailymotion video metadata (News, Entertainment, Family Clips).

- [x] Dailymotion Data API integration — fetch video details, thumbnails, channel metadata ([src/lib/dailymotion.ts](file:///home/jamesuchechi/Projects/Cozia/src/lib/dailymotion.ts))
- [x] Dailymotion Player SDK / iFrame Embed integration ([src/components/player/DailymotionPlayer.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/player/DailymotionPlayer.tsx))
- [x] Caching layer for Dailymotion metadata in Supabase `curated_videos` (`provider = 'dailymotion'`)
- [x] Dailymotion URL parser & validator (`dailymotion.com/video/{id}` and `dai.ly/{id}`)
- [x] Community "Suggest a Dailymotion Video" nomination flow into `moderation_queue` ([src/components/curation/NominateModal.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/curation/NominateModal.tsx))

**Done when:** You can curate a Dailymotion video URL and play it inside Cozia's player wrapper. *(Completed)*

---

## Phase 5 — Twitch Integration & Curation (Live Streams & Clips)

**Goal:** Fetch, embed, and curate Twitch Live Streams, Channel VODs, and Viral Clips.

- [x] Twitch Helix API integration — fetch live stream status, channel info, game categories, top clips ([src/lib/twitch.ts](file:///home/jamesuchechi/Projects/Cozia/src/lib/twitch.ts))
- [x] Twitch Embedded Interactive Player (Live Stream player + clip player) ([src/components/player/TwitchPlayer.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/player/TwitchPlayer.tsx))
- [x] "Live Now" special shelf rows on the browse page for active family-friendly Twitch streams
- [x] Caching layer for Twitch streams/clips in Supabase `curated_videos` (`provider = 'twitch'`)
- [x] Offline stream fallbacks to top channel clips or VODs

**Done when:** You can browse active Twitch live streams or clips, see a "Live Now" indicator, and watch live streams directly inside Cozia. *(Completed)*

---

## Phase 6 — Landing / Browse Page (Full YouTube Style UI)

**Goal:** Centerpiece deliverable — Full YouTube-style video grid & navigation (Desktop Sidebar + Top Filter Bar + Mobile Bottombar).

- [x] Desktop Collapsible Sidebar Navigation (Home, Shorts, Live Streams, Watch Together, My List, Moderation, Profile) ([src/components/layout/Sidebar.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/layout/Sidebar.tsx))
- [x] Mobile Bottom Navigation Bar (Home, Shorts, Live, Feed, Profile) ([src/components/layout/BottomNav.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/layout/BottomNav.tsx))
- [x] Provider Filter & Search Topbar ([src/components/layout/Navbar.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/layout/Navbar.tsx))
- [x] YouTube-Style Responsive Video Grid Layout ([src/components/video/VideoGrid.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/video/VideoGrid.tsx)) *(No hero banner per user preference)*
- [x] Horizontal scrolling row component ([src/components/video/VideoShelfRow.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/video/VideoShelfRow.tsx))
- [x] Provider badges on video cards (YouTube, Vimeo, Dailymotion, Twitch) + hover previews ([src/components/video/VideoCard.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/video/VideoCard.tsx))
- [x] "+ My List" & custom playlist bookmarks (save curated videos to user personal shelf)
- [x] Content safety tags & category filter chips (`All`, `Family Picks`, `Educational`, `Twitch Live`, `Shorts`, `Vimeo Films`)
- [x] Responsive multi-column layout for mobile, tablet, and desktop
- [x] Design tokens applied (Fraunces + Manrope fonts, color tokens per DESIGN.md)

**Done when:** You can load the browse page on desktop or mobile, navigate via sidebar/bottombar, filter by provider/category, bookmark to My List, and view content in a full YouTube-style video feed. *(Completed)*

---

## Phase 7 — Universal Video Playback & Custom Chrome

**Goal:** Universal `VideoPlayer` component supporting all 4 platforms wrapped in Cozia's UI chrome.

- [x] Universal `UniversalVideoPlayer` component with auto-routing based on `provider`: ([src/components/player/UniversalVideoPlayer.tsx](file:///home/jamesuchechi/Projects/Cozia/src/components/player/UniversalVideoPlayer.tsx))
  - `youtube` -> YouTube IFrame Player API
  - `vimeo` -> Vimeo Player SDK
  - `dailymotion` -> Dailymotion Player SDK
  - `twitch` -> Twitch Embed Interactive Player
- [x] Player chrome: title, description, channel/creator link, provider badge, category tags, safety badge
- [x] Reaction bar (Likes, Family Heart, Star, Laugh, Share) below player
- [x] Comments section (add/view comments per video)
- [x] "Related Videos" shelf below player (cross-platform recommendations in same category)

**Done when:** Clicking any video card (YouTube, Vimeo, Dailymotion, Twitch) launches the correct player engine wrapped in Cozia's custom UI. *(Completed)*

---

## Phase 8 — Social Layer & Universal "Watch Together"

**Goal:** Posts, comments, reactions, follows, and multi-platform Watch Together rooms.

- [ ] Follow/unfollow users & creator profiles
- [ ] Post creation (standalone post, or attached to any curated video/clip)
- [ ] Comments & threaded replies
- [ ] Universal "Watch Together" sync rooms powered by Supabase Realtime Broadcast:
  - Synchronized play/pause/seek across YouTube, Vimeo, Dailymotion, Twitch
  - Shareable room link (`/watch-party/:roomId`)
  - Real-time animated emoji reactions overlay & room chat
- [ ] Social feed page (posts & shared videos from followed users)
- [ ] "Popular in your community" shelf on browse page

**Done when:** Users can watch videos synchronously from any provider with friends via room links, follow profiles, and post to the social feed.

---

## Phase 9 — Moderation & Safety

**Goal:** Enforce the "family-safe" guarantee via multi-platform curation and UGC filtering.

- [ ] Moderation queue UI (approve/reject community nominations from YouTube, Vimeo, Dailymotion, Twitch, and flagged UGC)
- [ ] Basic auto-flagging for UGC (keyword/profanity filter)
- [ ] Safety-status enforcement — unapproved videos never appear on public rows (enforced via Supabase RLS)
- [ ] Reporting flow (users can report a post/comment/video)
- [ ] Audit log of moderation actions

**Done when:** Nothing reaches public browse rows without passing safety_status approval.

---

## Phase 10 — Polish & Performance

**Goal:** Deliver a state-of-the-art visual and responsive experience across all devices.

- [ ] Performance pass (Lighthouse audit, image lazy loading, row virtualization)
- [ ] Empty/error states across all routes
- [ ] Accessibility pass (keyboard navigation, ARIA labels, focus states, high contrast)
- [ ] Mobile & tablet responsive QA (smooth bottom bar & desktop sidebar transitions)
- [ ] SEO basics & OpenGraph tags for public profile & video pages

**Done when:** You would be proud to send Cozia to anyone without disclaimer.

---

## Phase 11 — Launch Prep

**Goal:** Deployment & production readiness.

- [ ] Hosting configured (Vercel / Netlify / Cloudflare Pages)
- [ ] Supabase production environment, Storage buckets, & RLS verified
- [ ] Custom domain live with SSL
- [ ] Terms of Service & Privacy Policy
- [ ] Seed content populated across YouTube, Vimeo, Dailymotion, and Twitch

**Done when:** Cozia is live on custom domain, monitored, and stocked with curated multi-platform content.

---

## Phase 12 — Post-Launch / Growth (Backlog)

- [ ] Multi-profile "household" accounts (Netflix-style profile picker)
- [ ] Push notifications (new video drops, watch party invites)
- [ ] Creator tools & partner badges
- [ ] Native mobile app (React Native)

---

## Notes

- **API Quota Management:** Each provider (YouTube, Vimeo, Dailymotion, Twitch) has rate limits — cache metadata in Supabase `curated_videos`.
- **Multi-Player Engine:** Keep player SDKs isolated in modular components (`components/player/YouTubePlayer.tsx`, `VimeoPlayer.tsx`, `DailymotionPlayer.tsx`, `TwitchPlayer.tsx`).
- **Scope discipline:** Phases 0–7 represent the core MVP. Phase 8–11 make it launch-worthy.