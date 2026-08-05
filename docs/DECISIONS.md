# Cozia — Decisions Log

Running log of key decisions and the reasoning behind them. Add to this as the project evolves — future-you (or anyone who joins later) will want the "why," not just the "what."

---

### 2026-08-05 — Project name: Cozia
Wanted family-safe *feel* without spelling "family" or "safe" into the name (avoids boxing the brand in, avoids reading as cheap/childish). Cozia evokes "cozy" without being literal.

### 2026-08-05 — Pivoted away from X-Cloud
Decided not to continue building X-Cloud for Cloud X Creative Hub Limited — no long-term conviction in the project as scoped. Chose to build an independent, more powerful version of the same concept (family-friendly social + streaming/creator platform) solo instead.

### 2026-08-05 — Video sourced from YouTube, not self-hosted (v1)
Core wedge is watching video (shorts + full-length), but Cozia will not host or own video content in v1 — YouTube retains all rights, video is served via the IFrame Player API. This avoids storage/transcoding cost and copyright liability while still delivering a real content experience on day one. Revisit hosting originals only once the YouTube-sourced model proves the concept (see TODO Phase 9).

### 2026-08-05 — Layout: Netflix-style rows, not YouTube-style grid
Chose hero banner + horizontal scrolling rows (Netflix convention) over a dense grid (YouTube convention) for the browse page. Rows imply curation and trust ("someone picked this for you"); a grid implies "everything, unfiltered." This reinforces the family-safe positioning visually without saying it in copy. Playback itself still uses YouTube's own embedded player — only the *browse/discovery* layout is Netflix-inspired.

### 2026-08-05 — Solo build
Building without a team for now. Tooling and process choices (e.g. moderation UI, CI setup) should optimize for one person's throughput, not team collaboration overhead.

### 2026-08-05 — Simplified Stack: Single React + Supabase Project (No Monorepo, No Python API)
Pivoted from a monorepo + Python FastAPI backend setup to a lean, single-package React + Vite + TypeScript frontend at root, backed directly by Supabase (`@supabase/supabase-js`). This removes backend maintenance overhead and speeds up MVP development while leveraging Supabase Postgres, Auth, and Storage natively.

---

_Add new entries above this line, most recent first is fine or chronological — pick one and stay consistent._