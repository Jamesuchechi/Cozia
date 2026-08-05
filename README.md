# Cozia

Family-friendly social + streaming platform. Watch curated YouTube video (shorts and full-length) inside a Netflix-style browsing experience, with a social/community layer on top.

Built solo. Built to be better than X-Cloud ever would have been.

## What Cozia Is

- A **browse/discovery layer** styled like Netflix (hero banner + horizontal scrolling rows) instead of a dense grid — implies curation and safety without saying "family" out loud.
- A **playback layer** powered by the YouTube IFrame Player API. YouTube owns all rights to the video content; Cozia does not host, download, or re-serve video.
- A **social layer**: profiles, follows, reactions, comments, community activity ("Friends are watching", "Popular in your community").
- **Family-safe by design**: curation, tagging, and moderation control what surfaces — not what the raw YouTube catalog contains.

## What Cozia Is Not (v1)

- Not a video host. No original video storage/transcoding in v1.
- Not a full YouTube clone. No arbitrary search-the-whole-internet experience — content surfaces through curated rows/categories.
- Not multi-tenant / white-label (yet).

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + Tailwind + shadcn/ui |
| Backend | FastAPI (thin service layer, keeps YouTube API key server-side) |
| Database / Auth / Storage | Supabase (Postgres, Auth, Storage) |
| Background jobs | ARQ (Redis-backed) — for cache refresh, metadata sync, moderation queue processing |
| Video | YouTube Data API v3 (search/metadata) + YouTube IFrame Player API (playback) |
| Cache | Redis |

## Repo Structure (proposed)

```
cozia/
├── apps/
│   ├── web/              # React/Vite frontend
│   └── api/               # FastAPI backend
├── packages/
│   └── shared-types/      # Shared TS types between web and any future clients
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── TODO.md
│   └── DECISIONS.md
└── infra/                 # Supabase migrations, deploy configs
```

## Getting Started

_(Fill in once repo is initialized — Phase 0 in TODO.md)_

## Docs Index

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design, data flow, API boundaries
- [DESIGN.md](./DESIGN.md) — UI/UX direction, layout references, design tokens
- [TODO.md](./TODO.md) — phased build plan, Phase 0 → completion
- [DECISIONS.md](./DECISIONS.md) — running log of key decisions and why