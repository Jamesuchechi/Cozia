# Cozia Infrastructure & Database Setup

This folder holds database migrations, infrastructure scripts, and deployment configurations for Cozia.

## Database (Supabase)

- Supabase Postgres schema migrations will live in `infra/migrations/`.
- Row-Level Security (RLS) policies for `users`, `curated_videos`, `rows`, `follows`, `posts`, `comments`, `reactions`, and `moderation_queue`.

## Services

- **Web Frontend**: Vite/React SPA hosted on Vercel / Netlify / Cloudflare Pages.
- **API Backend**: FastAPI hosted on Railway / Fly.io / Render.
- **Background Jobs**: ARQ worker connected to Redis (e.g. Upstash / Railway Redis).
