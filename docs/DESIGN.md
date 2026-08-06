# Cozia — Design Direction

## 1. Reference Points

- **Layout base: Netflix + YouTube Hybrid.** Hero banner (large featured video/collection at top) + horizontal scrolling rows below ("Family Picks", "Trending Shorts", "Twitch Live", "Vimeo Documentaries", "Popular in your community").
- **Playback Engine:** Universal player wrapping **YouTube, Vimeo, Dailymotion, and Twitch** embedded APIs in Cozia's custom UI chrome (title, description, provider badges, related row, comments/reactions below — not native surrounding platform clutter).
- **Navigation:** YouTube-style **Collapsible Desktop Sidebar** + Mobile **Bottom Navigation Bar** (Home, Browse, Live, Watch Party, Social Feed, My List, Profile).
- **Explicitly avoided:** Dense, overwhelming algorithm grids. Rows signal "someone curated this for you" — which reinforces trust without sounding restrictive or childish.

## 2. Brand Feel

- Name: **Cozia** — family-safe in *feel*, not spelled out. Brand tone is warm, calm, and premium — inspired by top streaming platforms (Netflix, Apple TV+).
- Palette: Dark base (`#12110E`) with warm surface containers (`#1C1A16`), gold accents (`#E8A33D`), and soft teal accents (`#3E8E7E`).
- Typography: Display serif font (**Fraunces**) for headlines/brand logo + modern sans-serif (**Manrope**) for crisp UI elements.

## 3. Navigation & App Layout

1. **Header/Topbar**: Logo (`Cozia.`), global search input, provider filter tabs, notifications, profile switcher.
2. **Desktop Sidebar**: Collapsible left navigation bar with quick links:
   - Home / Browse
   - Live Streams (Twitch)
   - Watch Together (Sync Rooms)
   - Community Feed
   - My Saved List
   - Moderation Queue (Admin/Curator view)
   - Profile & Settings
3. **Mobile Bottom Navigation Bar**: Sticky 5-icon bottom bar for touch devices (Home, Browse, Live, Feed, Profile).
4. **Hero Section**: Large featured banner spotlight with auto-rotating highlights, title, short description, and 1-tap Play button.
5. **Horizontal Scrolling Rows (Netflix-style)**:
   - Family Picks
   - Trending Shorts (YouTube Shorts)
   - Live Now (Twitch Family Streamers)
   - High-Art & Indie Short Films (Vimeo)
   - Popular in Your Community (Social signal)
   - Duration & Category Shelves (`< 10 mins`, `Storytime`, `Educational`)

## 4. Multi-Platform Video Player & Chrome

- **Universal Player Container**: Auto-routes to the appropriate SDK:
  - **YouTube**: IFrame Player API
  - **Vimeo**: Vimeo Player JS SDK
  - **Dailymotion**: Dailymotion Player SDK
  - **Twitch**: Twitch Interactive Embed (Live Stream + Chat overlay)
- **Player Chrome**: Title, description, creator channel link, platform badge (YouTube / Vimeo / Dailymotion / Twitch), safety status badge, reaction bar (Likes, Hearts, Stars), and comment thread.
- **Below Player**: "Related Videos" shelf pulling cross-platform content from the same category.

## 5. Profile & User Experience

- **Public Profile View (`/profile/:id`)**: Avatar, display name, handle, bio, social links, saved list showcase, activity feed, and follower counts.
- **Edit Profile View (`/profile/edit`)**: Avatar upload (Supabase Storage `avatars`), display name, custom handle, bio, social links, and parental PIN management.
- **Parental Controls & PIN Mode**: 4-digit PIN toggle that locks settings and restricts browsing strictly to kids-approved categories.