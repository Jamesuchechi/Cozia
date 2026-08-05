# Cozia — Design Direction

## 1. Reference Points

- **Layout base: Netflix.** Hero banner (large featured video/collection at top) + horizontal scrolling rows below ("Family Picks", "Trending Shorts", "New This Week", "Because you watched X", "Popular in your community").
- **Playback: YouTube IFrame Player**, wrapped in Cozia's own chrome (title, description, related row, comments/reactions below — not YouTube's native surrounding UI).
- **Explicitly avoided:** YouTube's dense homepage grid. A grid signals "everything, unfiltered, algorithmic." Rows signal "someone curated this for you" — which is the trust signal Cozia needs without saying "safe" or "family" in the UI copy.

## 2. Brand Feel

- Name: **Cozia** — family-safe in *feel*, not spelled out. Brand tone should be warm, calm, trustworthy — not childish, not clinical.
- Avoid: bright primary-color "kids app" palettes, cartoonish iconography, anything that reads as a locked-down/restricted product.
- Aim for: the warmth of a well-designed streaming app (think Netflix/Apple TV+ visual polish) with a softer, more approachable edge than YouTube's utilitarian look.

## 3. Landing / Browse Page Structure

1. **Header/Nav** — logo (Cozia), search, profile/household switcher, sign in.
2. **Hero section** — large featured banner: auto-rotating or curated "spotlight" video/collection, title, short description, Play button.
3. **Rows** (horizontal scroll, Netflix-style):
   - Family Picks
   - Trending Shorts
   - New This Week
   - Popular in Your Community (social signal — differentiates from Netflix/YouTube)
   - Category rows (Kids, Education, Comedy, Music, etc. — TBD based on curation categories)
4. **Footer** — standard (about, contact, terms — minimal for v1)

## 4. Video Detail / Player View

- Player (YouTube IFrame) front and center, Cozia chrome around it.
- Below player: title, description, curator/category tags, reactions, comment thread.
- Right rail or below: "Related" row pulling from same category/curation tags.

## 5. Design Tokens (starting point — refine once brand/logo work happens)

- **Typography:** Clean sans-serif (e.g. Inter or similar) for UI; slightly warmer display font for the logo/hero headlines if desired.
- **Color:** Dark or dark-leaning base (Netflix/streaming convention — makes video thumbnails pop), with a warm accent color (not YouTube red, not Netflix red — differentiate) — consider a warm coral, amber, or soft teal as the Cozia accent.
- **Corner radius / density:** Rounded cards (softer than YouTube's sharp thumbnails), generous spacing — reinforces "calm" over "infinite feed."

## 6. Open Design Questions

- Logo/wordmark direction — not started.
- Exact accent color — needs a quick palette exploration once frontend scaffolding begins.
- Mobile-first vs. desktop-first for the initial build (Netflix/YouTube both are heavily mobile-used).