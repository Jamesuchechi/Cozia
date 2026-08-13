# Cozia Overhaul Blueprint & Master Execution Plan (TODO2.md)

**Author:** Staff Principal Architect & Lead Product Manager  
**Project:** Cozia Multi-Provider Video Platform Overhaul  
**Target Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Zustand + Supabase + Vercel Serverless Functions  
**Status:** In Progress (Planning & Execution Specification)

---

## Executive Summary & Architectural Vision

**Cozia** is being upgraded from a YouTube-focused curated frontend into an **enterprise-grade, high-performance, legal multi-provider media discovery and streaming platform**. 

Inspired by **Ikoro's music architecture**, Cozia will aggregate video metadata and streaming payloads from **YouTube, Vimeo, Twitch, Dailymotion, PeerTube, and Internet Archive Video**, normalize them into a single unified Data Transfer Object (`Video`), and execute playback through a **Hybrid Dual-Engine Player Architecture** (Native HTML5 Media + Provider IFrame SDKs).

### Key Upgrades Beyond Current State:
1. **Universal 6-Provider Ingestion**: Native integration with YouTube, Vimeo, Twitch, Dailymotion, PeerTube, and Internet Archive.
2. **Multi-Tier Stream Resolution Proxy**: Serverless waterfall (`Cobalt` ➔ `Invidious` ➔ `Piped` ➔ `IFrame SDK`) resolving direct MP4/HLS (`.m3u8`) video streams for keyless, high-reliability playback.
3. **Zustand State Architecture**: Global store (`videoPlayerStore`) decoupling player state, queue management, quality selection (`1080p`, `720p`, `480p`, `auto`), aspect ratio handling (`16:9` widescreen vs `9:16` vertical Shorts), and Watch Party synchronization.
4. **Dynamic Ambient Lighting Engine**: Real-time canvas color extraction from thumbnails injecting dynamic `OKLCH` / `HSL` CSS variables for Apple Music / YouTube Ambient Mode background glows.
5. **4-Tier Video Curation Engine**: Regional Trending Charts, Editorial Topic Collections, Format & Pacing Mixes (Shorts vs Longform vs Ambient), and Algorithmic "For You" Personalization filtered through Cozia's Supabase RLS Family-Safety Gate.
6. **Frame-Accurate Realtime Watch Parties**: Supabase Realtime Broadcast channel syncing play/pause/seek across heterogeneous rendering engines with emoji overlays.
7. **Offline Video Caching (IndexedDB)**: Storing open MP4 blobs (PeerTube, Internet Archive) for offline PWA viewing.

---

## Architectural Master Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT LAYER (React 18 + Vite)                           │
│                                                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────────┐  ┌────────────────────────┐  │
│  │   UI Pages & Components│ │  Zustand videoPlayerStore   │  │ Ambient Canvas Engine  │  │
│  │(Home, Shorts, Player)│  │  (Queue, Quality, WatchParty)│  │(accent.ts - Hue Glow)  │  │
│  └──────────┬───────────┘  └──────────────┬──────────────┘  └───────────┬────────────┘  │
└─────────────│─────────────────────────────│─────────────────────────────│───────────────┘
              │                             │                             │
              ▼                             ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               AGGREGATOR & CURATION ENGINE                              │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                      Multi-Provider Video Aggregator                              │  │
│  │                      (src/lib/video/aggregator.ts)                                │  │
│  │                                                                                   │  │
│  │ • Parallel Multi-Source Ingestion & Search (Promise.all)                          │  │
│  │ • Deduplication (`norm(title)-norm(creator)`) & Source Priority Ranking           │  │
│  │ • 4-Tier Curation Engine (Trending Charts, Topics, Aspect/Duration Mixes, For You)│  │
│  │ • In-Memory TTL Cache System (src/lib/video/cache.ts)                             │  │
│  └──────────────────────────────────────┬────────────────────────────────────────────┘  │
│                                         │                                               │
│  ┌──────────────────────────────────────┴────────────────────────────────────────────┐  │
│  │                        Hybrid Media Playback Engine                               │  │
│  │                                                                                   │  │
│  │  ┌──────────────────────────────────────┐   ┌──────────────────────────────────┐  │  │
│  │  │ Engine A: Native HTML5 Video Element │   │ Engine B: Multi-Provider IFrames │  │  │
│  │  │ (Direct MP4, M3U8 HLS, PeerTube/IA)   │   │ (YouTube, Twitch, Vimeo, Daily)  │  │  │
│  └──────────────────────────────────────┘   └──────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────┬───────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND & SERVERLESS LAYER                                │
│                                                                                         │
│  ┌───────────────────────────┐ ┌────────────────────────────┐ ┌──────────────────────┐  │
│  │   Vercel Serverless API   │ │ Multi-Tier Stream Resolver │ │   Supabase Backend   │  │
│  │  (/api/video-stream-proxy)│ │ (Cobalt ➔ Invidious ➔ Piped│ │(Auth, RLS, DB, Sync) │  │
│  └─────────────┬─────────────┘ └─────────────┬──────────────┘ └──────────┬───────────┘  │
└────────────────│─────────────────────────────│───────────────────────────│──────────────┘
                 │                             │                             │
                 ▼                             ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EXTERNAL PROVIDER APIS                                  │
│                                                                                         │
│ [YouTube API v3] [Vimeo API] [Twitch Helix/GQL] [Dailymotion] [PeerTube] [Internet Archive]│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Task Breakdown & Implementation Roadmap

### Phase 1: Universal Data Model & Provider Abstraction Layer

**Goal:** Establish a single, canonical `Video` Data Transfer Object (DTO), type system, caching layer, string normalization algorithms, and integration of open provider APIs (PeerTube & Internet Archive).

- [x] **1.1 Canonical DTO Definitions (`src/types/video.ts`)**
  - Create `VideoSource` type (`'youtube' | 'vimeo' | 'twitch' | 'dailymotion' | 'peertube' | 'internetarchive'`).
  - Create `VideoFormat` type (`'horizontal' | 'vertical' | 'square'`).
  - Create `QualityOption` type (`'1080p' | '720p' | '480p' | '360p' | 'auto'`).
  - Define `Video` interface:
    ```typescript
    export interface Video {
      id: string; // e.g. "yt:v123", "pt:456"
      source: VideoSource;
      providerVideoId: string;
      title: string;
      description: string;
      creator: string;
      creatorId?: string;
      creatorAvatarUrl?: string;
      thumbnailUrl: string;
      bannerUrl?: string;
      directStreamUrl?: string;
      embedUrl?: string;
      durationMs: number;
      aspectRatio: '16:9' | '9:16' | '4:3';
      category: string;
      tags: string[];
      viewCount?: number;
      likeCount?: number;
      isLive?: boolean;
      isFullPlay: boolean;
      isDownloadable: boolean;
      safetyStatus: 'pending' | 'approved' | 'rejected';
      addedAt: string;
    }
    ```
  - Define `VideoChannel` and `VideoPlaylist` types.

- [x] **1.2 High-Performance Cache Infrastructure (`src/lib/video/cache.ts`)**
  - Implement a generic `TTLCache` utility supporting `get`, `set`, `has`, `clear`, and `wrap(key, ttlMs, fetcherFn)`.
  - Set TTL constants:
    - Search Queries: 15 minutes (`TTL.SEARCH`)
    - Trending / Top Charts: 1 hour (`TTL.CHARTS`)
    - Stream Proxy URLs: 4 hours (`TTL.STREAM_URL`)
    - Metadata / Details: 24 hours (`TTL.METADATA`)

- [x] **1.3 Normalization & Deduplication Utility (`src/lib/video/normalizer.ts`)**
  - Build `normalizeString(input: string)` stripping brackets (e.g. "[OFFICIAL VIDEO]", "(4K 60FPS)"), special symbols, spaces, and casing.
  - Construct deduplication key generator: `getDedupeKey(title, creator)`.
  - Build priority resolution matrix: YouTube (Priority 1) ➔ Vimeo (Priority 2) ➔ Twitch (Priority 3) ➔ Dailymotion (Priority 4) ➔ PeerTube (Priority 5) ➔ Internet Archive (Priority 6).

- [x] **1.4 PeerTube Client SDK (`src/lib/video/peertube.ts`)**
  - Implement federated PeerTube search across public instances (`framatube.org`, `peertube.stream`).
  - Normalize PeerTube JSON response into standard `Video` DTO (extracting direct HLS `.m3u8` and WebTorrent URLs).

- [x] **1.5 Internet Archive Video SDK (`src/lib/video/internetarchive.ts`)**
  - Implement IA Advanced Search API wrapper filtering for `mediatype:movies`.
  - Parse direct `.mp4` download links from IA item metadata into `directStreamUrl`.


---

### Phase 2: Multi-Source Video Aggregator & Client-Side Ingestion

**Goal:** Build a parallel multi-provider search and discovery engine that queries enabled video providers concurrently, normalizes the results, deduplicates candidates, and handles provider failures gracefully.

- [x] **2.1 Multi-Source Search & Aggregator Engine (`src/lib/video/aggregator.ts`)**
  - Implement `searchAllSources(query: string, options: SearchOptions): Promise<Video[]>`:
    - Launch concurrent calls using `Promise.allSettled()` across `searchYouTube()`, `searchVimeo()`, `searchTwitch()`, `searchDailymotion()`, `searchPeerTube()`, `searchInternetArchive()`.
    - Apply fallback boundaries (`.catch(() => [])`) so single-provider timeouts never crash the query.
    - Flatten results and process through `deduplicateAndSort()`.
  - Wrap search results in `TTLCache`.

- [x] **2.2 Quota-Aware Ingestion Pipeline (`src/lib/video/ingestionEngine.ts`)**
  - Build a rate-limiter and quota tracker for YouTube Data API v3 and Vimeo API.
  - Implement automatic provider backoff: if YouTube API quota returns `429` / `quotaExceeded`, automatically switch primary provider to Invidious / Vimeo / PeerTube for the remainder of the session.

- [x] **2.3 Catalog Migration & Seed Compatibility**
  - Update `src/lib/seed-data.ts` to map legacy `CuratedVideo` entries to the new normalized `Video` DTO format.
  - Create adapter utility `toNormalizedVideo(curated: CuratedVideo): Video`.


---

### Phase 3: Serverless Multi-Tier Stream Extraction Proxy

**Goal:** Build a resilient Vercel serverless function (`/api/video-stream-proxy`) that extracts direct streaming links (MP4 / HLS `.m3u8`) for YouTube and other restricted providers using a 4-tier waterfall fallback strategy.

- [x] **3.1 Serverless Resolution Waterfall Endpoint (`api/video-stream-proxy.ts`)**
  - Implement Vercel Serverless Function accepting `videoId`, `provider`, and `quality`.
  - Tier 1: Query Cobalt API cluster instances (`https://api.cobalt.tools`). Return direct stream URL if successful.
  - Tier 2: Query Invidious API instances (`/api/v1/videos/:id`). Extract `adaptiveFormats` or direct `hlsUrl`.
  - Tier 3: Query Piped API instances (`/streams/:id`). Extract video/audio merged streams or HLS playlists.
  - Tier 4: Fall back to standard IFrame embed link (`https://www.youtube.com/embed/:id?autoplay=1`).

- [x] **3.2 Range Request & CORS Proxy Handler (`api/stream-cors-proxy.ts`)**
  - Build a lightweight streaming proxy to relay range requests (`HTTP 206 Partial Content`) for native HTML5 video player seeking when third-party CDN headers restrict CORS.


---

### Phase 4: Global State Architecture (Zustand `videoPlayerStore`)

**Goal:** Centralize all player controls, queue management, quality options, aspect ratio detection, and Watch Party sync into a unified Zustand store.

- [x] **4.1 Core Zustand Player Store (`src/stores/videoPlayerStore.ts`)**
  - Define state interface:
    - `currentVideo: Video | null`
    - `isPlaying: boolean`
    - `currentTime: number`
    - `duration: number`
    - `volume: number`
    - `isMuted: boolean`
    - `playbackRate: number` (0.5x, 1.0x, 1.25x, 1.5x, 2.0x)
    - `quality: QualityOption`
    - `aspectRatio: '16:9' | '9:16'`
    - `queue: Video[]`
    - `queueIndex: number`
    - `isShuffle: boolean`
    - `isRepeat: boolean`
    - `isPictureInPicture: boolean`
    - `watchPartyRoomId: string | null`
    - `isHost: boolean`
  - Define actions: `playVideo(video, queue?)`, `togglePlay()`, `seekTo(time)`, `setVolume(vol)`, `setQuality(q)`, `nextVideo()`, `previousVideo()`, `reorderQueue(fromIndex, toIndex)`, `addToQueue(video)`, `toggleWatchParty(roomId)`.
  - Integrate `zustand/middleware` `persist` for volume, preferred quality, and playback speed.

- [x] **4.2 User Affinity & Watch History Store (`src/stores/userStore.ts`)**
  - Store watch history (`watchedVideoIds`, `lastPositionMap`), saved videos, liked channels, and category preferences.
  - Automatically sync watch history to Supabase Postgres `user_watch_history` table for logged-in users.


---

### Phase 5: Dual-Engine Hybrid Media Player (`UniversalVideoPlayer.tsx`)

**Goal:** Refactor Cozia's video player to support seamless dual rendering: Native HTML5 Video Element (Engine A) for direct stream URLs / HLS streams and Provider IFrame SDKs (Engine B) for embedded fallbacks.

- [x] **5.1 Engine A: Native HTML5 Video & HLS.js Player (`src/components/player/NativeVideoEngine.tsx`)**
  - Implement native `<video>` wrapper supporting direct `.mp4`, `.webm`, and `.m3u8` HLS streams via `hls.js`.
  - Handle picture-in-picture (`document.pictureInPictureElement`), full screen API, and smooth seeking.
  - Add buffer progress indicators and custom HTML5 UI controls.

- [x] **5.2 Engine B: Unified IFrame Player SDK Wrapper (`src/components/player/IFrameVideoEngine.tsx`)**
  - Combine YouTube IFrame API, Vimeo Player SDK, Twitch Player API, and Dailymotion SDK into a unified postMessage event wrapper.
  - Map provider-specific player events (`onStateChange`, `onTimeUpdate`, `onEnded`) to `videoPlayerStore` actions.

- [x] **5.3 Master Dual-Engine Switcher (`src/components/player/UniversalVideoPlayer.tsx`)**
  - Check `currentVideo.directStreamUrl`:
    - If direct stream URL is present and working ➔ Render `NativeVideoEngine` (Engine A).
    - If direct stream fails or unavailable ➔ Fall back automatically to `IFrameVideoEngine` (Engine B).
  - Add seamless error boundary: if Engine A encounters a network error (`MEDIA_ERR_SRC_NOT_SUPPORTED`), trigger fallback to Engine B without stopping playback.


---

### Phase 6: Dynamic Visual Identity Engine (Ambient Lighting & Canvas Extraction)

**Goal:** Extract the dominant accent color from video thumbnails in real time, injecting dynamic CSS variables (`OKLCH`/`HSL`) for smooth background ambient lighting around the player and UI.

- [x] **6.1 Canvas Color Extractor (`src/lib/video/accent.ts`)**
  - Build `extractDominantColor(imageUrl: string): Promise<{ hue: number; saturation: number; lightness: number } | null>`:
    - Load thumbnail onto offscreen HTML5 `<canvas>` (50x50px).
    - Calculate average RGB vector.
    - Convert RGB to HSL and `OKLCH` values.
    - Ignore pure black, pure white, and low-contrast grayscale colors to extract vivid accent hues.
  - Implement `applyAmbientGlow(hue: number)` setting `:root` CSS variables `--accent-hue`, `--ambient-glow`, and `--ambient-bg`.

- [x] **6.2 Dynamic CSS Ambient Lighting Styles (`src/index.css`)**
  - Add ambient glow backdrop container behind player viewport:
    ```css
    .ambient-glow-container {
      background: radial-gradient(
        circle at 50% 30%,
        oklch(60% 0.22 var(--accent-hue, 220) / 0.35) 0%,
        oklch(20% 0.05 var(--accent-hue, 220) / 0.1) 60%,
        transparent 100%
      );
      filter: blur(60px);
      transition: background 1000ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    ```
  - Apply hover glow borders to video cards and shelf row headers.


---

### Phase 7: 4-Tier Video Curation & Recommendation Engine

**Goal:** Build a robust 4-tier video discovery engine that powers Cozia's browse shelves while strictly enforcing Supabase `safety_status === 'approved'` family safety policies.

- [x] **7.1 Tier 1: Regional & Country Top Charts (`src/lib/video/curation/charts.ts`)**
  - Connect to YouTube `videos?chart=mostPopular&regionCode={regionCode}`, Dailymotion `/trending`, and Vimeo Staff Picks.
  - Merge and rank trending items by view velocity. Filter against Supabase safety status.

- [x] **7.2 Tier 2: Editorial & Topic Collections (`src/lib/video/curation/editorial.ts`)**
  - Build curated topic feeds:
    - *Tech & Coding Deep Dives* (System architecture, React, AI demos)
    - *Indie Cinema & Short Films* (Vimeo Staff Picks, festival trailers)
    - *Gaming & Esports Highlights* (Twitch top clips, speedruns)
    - *Kids & Family Adventures* (Science experiments, animations, nature documentaries)

- [x] **7.3 Tier 3: Format, Aspect Ratio & Duration Mixes (`src/lib/video/curation/formats.ts`)**
  - **Shorts & Clips Mix**: Filter for `aspectRatio === '9:16'` or `durationMs < 240000` (4 minutes). Render in vertical mobile-first TikTok/Reels carousel.
  - **Longform & Documentaries**: Filter for `durationMs > 1200000` (20 minutes). Render in widescreen Netflix-style hero banner.
  - **Ambient & Study Streams**: Filter for lo-fi, nature streams, background audio visuals.

- [x] **7.4 Tier 4: Algorithmic "For You" Personalization (`src/lib/video/personalization.ts`)**
  - Calculate user taste profile vector from:
    - Category frequency in watch history (weight = 0.4)
    - Liked creators / channels (weight = 0.3)
    - Saved videos (weight = 0.3)
  - Rank unvisited approved candidate videos against taste vector to generate personalized "Recommended for You" home shelf.


---

### Phase 8: High-Performance Social Layer & Universal "Watch Together"

**Goal:** Wire Supabase Realtime Broadcast channels into `videoPlayerStore` to create frame-accurate, synchronized multi-platform Watch Party rooms.

- [x] **8.1 Realtime Watch Party Engine (`src/lib/video/watchParty.ts`)**
  - Create Supabase Realtime Broadcast channel per `roomId` (`cozia:watch-party:${roomId}`).
  - Relay playback events: `SEEK`, `PLAY`, `PAUSE`, `VIDEO_CHANGE`, `BUFFERING`.
  - Calculate clock offset using NTP-style ping (`serverTimeOffset = Date.now() - payload.timestamp`).
  - Enforce frame-accurate seek alignment (`Math.abs(localTime - targetTime) > 1.5s` ➔ auto-seek).

- [x] **8.2 Watch Party UI Component Overhaul (`src/pages/WatchParty.tsx`)**
  - Render `UniversalVideoPlayer` in synchronized guest mode.
  - Add interactive floating emoji reaction overlay (flying hearts, fire, party poppers across player).
  - Synchronized real-time chat with profanity auto-filter.
  - Shareable invitation link (`/watch-party/:roomId`) with copy button and QR code.

- [x] **8.3 Social Discovery Shelves**
  - Build "Friends Are Watching Right Now" shelf displaying active watch party rooms and recent friend activity from Supabase `follows` and `posts` tables.


---

### Phase 9: Enterprise Safety, Profanity Moderation & Admin Control

**Goal:** Guarantee family safety across both ingested third-party metadata and user-generated content (UGC).

- [ ] **9.1 UGC Profanity & Keyword Filter (`src/lib/moderation.ts`)**
  - Integrate profanity check on post content, video nominations, and comments before writing to Supabase.
  - Automatically flag suspicious posts (`safety_status = 'pending'`).

- [ ] **9.2 Kids Mode & Parental Controls**
  - Implement Parental PIN lock modal (`src/components/auth/ParentalPinModal.tsx`).
  - Kids Mode toggle restricting all views strictly to `isKidsApproved === true` shelves and videos.

- [ ] **9.3 Admin Moderation Control Center (`src/pages/ModerationQueue.tsx`)**
  - Extend moderation UI to allow bulk approval, bulk rejection, category tagging, and safety status overrides.
  - Write audit log entries to `moderation_actions` table for accountability.

---

### Phase 10: Performance Optimization, Offline PWA & Launch Readiness

**Goal:** Ensure 60fps UI performance, offline PWA storage, dynamic OpenGraph meta tags, and complete production readiness.

- [ ] **10.1 IndexedDB Offline Video Caching (`src/lib/video/offlineStorage.ts`)**
  - Use IndexedDB to cache downloadable open video blobs (PeerTube, Internet Archive).
  - Render "Downloaded / Available Offline" badge in `MyList.tsx`.

- [ ] **10.2 Virtualized List Rendering**
  - Integrate `@tanstack/react-virtual` for horizontal video shelves to maintain smooth 60fps scrolling with 500+ items.

- [ ] **10.3 Dynamic OpenGraph & Meta Tags (`src/lib/seo.ts`)**
  - Update route transitions to inject dynamic `<meta property="og:title">`, `<meta property="og:image">`, and `<meta property="og:description">` per video and profile.

- [ ] **10.4 Automated Verification Pass**
  - [ ] TypeScript strict check: `pnpm typecheck` (0 errors)
  - [ ] ESLint audit: `pnpm lint`
  - [ ] Production build verification: `pnpm build`

---

## Verification & Quality Checklist

1. **Multi-Source Aggregation**: Search returns merged and deduplicated results across YouTube, Vimeo, Twitch, Dailymotion, PeerTube, and Internet Archive.
2. **Stream Fallback Waterfall**: Serverless stream proxy resolves direct streams or gracefully falls back to IFrame embeds.
3. **Player State**: Seeking, pausing, queueing, quality switching, and volume changes function seamlessly through Zustand `videoPlayerStore`.
4. **Ambient Canvas Engine**: Page background updates with smooth HSL/OKLCH color glow based on current video artwork.
5. **Curation Shelves**: Home page renders Regional Trending, Editorial Topics, Shorts vs Longform, and Personalized feeds filtered by safety status.
6. **Watch Party**: Two independent browser windows join a Watch Party room and remain playback-synchronized within 1.5 seconds.
7. **Family Safety**: Unapproved videos never surface in public feeds or search results.
