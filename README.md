# Cozia

Family-friendly social + streaming platform. Watch curated YouTube content (shorts and full-length) inside a Netflix-style browsing experience, with a social/community layer on top.

Built solo. Powered by **React + Vite + Supabase**.

## What Cozia Is

- A **browse/discovery layer** styled like Netflix (hero banner + horizontal scrolling rows) instead of a dense grid — implies curation and safety without saying "family" out loud.
- A **playback layer** powered by the YouTube IFrame Player API. YouTube owns all rights to the video content; Cozia does not host, download, or re-serve video.
- A **social layer**: profiles, follows, reactions, comments, community activity ("Friends are watching", "Popular in your community").
- **Family-safe by design**: curation, tagging, and moderation control what surfaces — not what the raw YouTube catalog contains.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend & Auth & Storage | Supabase (Postgres, Auth, Realtime, Storage) |
| Video | YouTube Data API v3 + YouTube IFrame Player API |

## Repo Structure

```
cozia/
├── src/
│   ├── components/       # UI components & shelves
│   ├── lib/              # Supabase client, utils, helpers
│   ├── types/            # TypeScript interfaces
│   ├── App.tsx           # Main application view
│   ├── main.tsx          # React entry point
│   └── index.css         # Tailwind & global styles
├── docs/
│   ├── ARCHITECTURE.md   # System design & data models
│   ├── DESIGN.md         # Design system & tokens
│   ├── TODO.md           # Phased build plan
│   └── DECISIONS.md      # Key decisions log
├── infra/                # Supabase migrations & RLS policies
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Docs Index

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design, data flow, API boundaries
- [DESIGN.md](docs/DESIGN.md) — UI/UX direction, layout references, design tokens
- [TODO.md](docs/TODO.md) — phased build plan, Phase 0 → completion
- [DECISIONS.md](docs/DECISIONS.md) — running log of key decisions and why