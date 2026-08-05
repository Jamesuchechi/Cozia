# Cozia — Architecture

## 1. System Overview

```
┌─────────────┐      ┌──────────────────┐      ┌────────────────────┐
│   Browser    │◄────►│   FastAPI (api)   │◄────►│  Supabase (Postgres)│
│ React/Vite   │      │  - auth relay     │      │  - users, follows   │
│ (web app)    │      │  - YouTube proxy  │      │  - posts, comments  │
│              │      │  - moderation     │      │  - curated_videos   │
└──────┬───────┘      └────────┬──────────┘      └────────────────────┘
       │                       │
       │ IFrame Player API     │ YouTube Data API v3
       ▼                       ▼
┌─────────────┐      ┌──────────────────┐
│  YouTube     │      │  Redis + ARQ      │
│  (playback)  │      │  - metadata cache │
└─────────────┘      │  - background jobs│
                      └──────────────────┘
```

## 2. Core Principles

1. **Never re-host YouTube video.** Playback always happens through YouTube's own embedded player (IFrame API). Cozia stores metadata (video ID, title, thumbnail URL, category, curation tags) — never the video file itself.
2. **API key stays server-side.** All YouTube Data API calls go through the FastAPI backend so the API key/quota is never exposed to the browser.
3. **Curation is a first-class data model**, not an afterthought. A `curated_videos` table (Cozia's own data) sits alongside cached YouTube metadata — this is where "family-friendly" actually gets enforced, and where Cozia's differentiation lives.
4. **Social data is fully owned by Cozia.** Posts, comments, follows, reactions live in Supabase Postgres — no dependency on YouTube for anything social.

## 3. Data Model (high-level)

### Owned by Cozia (Supabase Postgres)
- `users` (Supabase Auth + profile extension: display name, avatar, family/household grouping if applicable)
- `follows` (user → user)
- `posts` (user-generated; may reference a `curated_video_id` or stand alone)
- `comments` (on posts or on videos)
- `reactions` (on posts, comments, or videos)
- `curated_videos` (Cozia's curation layer: youtube_video_id, category, tags, safety_status, added_by, added_at)
- `rows` / `shelves` (the horizontal row definitions shown on the browse page: "Family Picks", "Trending Shorts", "New This Week" — ordered lists of curated_video_id)
- `moderation_queue` (pending posts/comments/videos awaiting review)

### Cached from YouTube (not owned, refreshed periodically)
- Video metadata: title, thumbnail, channel name, duration, view count
- Cached via ARQ background job on a TTL (e.g. refresh every 24h) to respect API quota

## 4. API Boundaries (FastAPI)

- `GET /videos/curated?row=trending` — returns curated rows for browse page
- `GET /videos/{id}` — returns metadata + playback info for a single video
- `POST /videos/curate` — (admin/self, since solo) add a YouTube video into `curated_videos`
- `GET /feed` — social feed (posts, filtered by follows)
- `POST /posts`, `POST /comments`, `POST /reactions` — social write endpoints
- `GET /moderation/queue`, `POST /moderation/{id}/approve|reject` — moderation

Auth: Supabase Auth JWT verified on every request; FastAPI is a thin trust boundary, not a full auth system.

## 5. Video Playback Flow

1. User clicks a video card on the browse page.
2. Frontend requests `/videos/{id}` from FastAPI → gets cached metadata + confirms video is still curated/approved.
3. Frontend mounts the YouTube IFrame Player with the `youtube_video_id`.
4. Playback, ads (if any), and rights are entirely YouTube's — Cozia only wraps the player in its own UI chrome (related rows, comments, reactions below the player).

## 6. Moderation & Safety

- Every video entering `curated_videos` goes through a `safety_status` field: `pending → approved → live`, or `rejected`.
- User-generated content (posts/comments) can be auto-flagged (basic keyword/profanity filter in v1) and routed to `moderation_queue`.
- Since this is solo-run initially, moderation tooling should be efficient (bulk actions, keyboard shortcuts) rather than elaborate — it's one person's job to review it.

## 7. Caching & Rate Limits

- YouTube Data API v3 has daily quota limits — all reads go through Redis cache first; ARQ background jobs refresh metadata rather than hitting the API on every page load.
- Cache TTL: video metadata 24h, channel metadata 7d (tune based on observed quota usage).

## 8. Open Architecture Questions

- Household/family grouping: single-user accounts only in v1, or multi-profile "household" accounts (like Netflix profiles) from the start?
- Moderation: fully manual (solo) initially, or wire in a basic automated content filter for both YouTube category safety and UGC from day one?
- Real-time (live "friends are watching now"): polling vs. Supabase Realtime — defer until social layer has real usage data.