# Cozia — Architecture

## 1. System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                       │
│        React 18 + Vite + TypeScript + Tailwind          │
│                                                         │
│  ┌──────────────────────┐     ┌──────────────────────┐  │
│  │ YouTube IFrame API   │     │ YouTube Data API v3  │  │
│  │ (Video Playback)     │     │ (Metadata Fetching)  │  │
│  └──────────┬───────────┘     └──────────┬───────────┘  │
└─────────────┼────────────────────────────┼──────────────┘
              │                            │
              ▼                            ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ YouTube Platform        │     │ Supabase                │
│ - Video streaming       │     │ - Postgres Database     │
│ - Rights management     │     │ - Auth (JWT / Sessions) │
│ - Ads (if any)          │     │ - Storage (Avatars)     │
└─────────────────────────┘     │ - Realtime (Social)     │
                                └─────────────────────────┘
```

## 2. Core Principles

1. **Never re-host YouTube video.** Playback always happens through YouTube's own embedded player (IFrame API). Cozia stores metadata (video ID, title, thumbnail URL, category, curation tags) — never the video file itself.
2. **Direct Supabase Integration.** All database CRUD operations, authentication, and security rules are handled directly via `@supabase/supabase-js` and Row-Level Security (RLS) policies.
3. **Curation is a first-class data model.** A `curated_videos` table in Supabase sits alongside fetched YouTube metadata — this is where "family-friendly" safety status gets enforced.
4. **Social data is fully owned by Cozia.** Posts, comments, follows, reactions live in Supabase Postgres — no dependency on YouTube for social features.

## 3. Data Model (Supabase Postgres)

- `users` (Supabase Auth + profile extension: display name, avatar)
- `follows` (follower_id → following_id)
- `posts` (user-generated; references optional `curated_video_id`)
- `comments` (on posts or videos)
- `reactions` (on posts, comments, or videos)
- `curated_videos` (youtube_video_id, category, tags, safety_status: pending | approved | rejected)
- `rows` / `shelves` (definitions for browse page horizontal rows)
- `moderation_queue` (pending items for moderation review)

## 4. Video Playback Flow

1. User clicks a video card on the browse page.
2. Frontend queries Supabase `curated_videos` to confirm `safety_status === 'approved'`.
3. Frontend mounts the YouTube IFrame Player with the `youtube_video_id`.
4. Playback and rights remain YouTube's — Cozia wraps the player in its own UI chrome (related rows, comments, reactions below player).

## 5. Moderation & Safety

- Every video in `curated_videos` is filtered by `safety_status`. Unapproved items are never exposed via RLS to public queries.
- User-generated content (posts/comments) can be auto-flagged and routed to `moderation_queue`.