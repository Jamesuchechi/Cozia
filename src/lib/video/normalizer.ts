import { Video, VideoSource } from '../../types/video';

/**
 * Provider priority order matrix. Lower index = higher priority.
 */
const PROVIDER_PRIORITY_MAP: Record<VideoSource, number> = {
  youtube: 1,
  vimeo: 2,
  twitch: 3,
  dailymotion: 4,
  peertube: 5,
  internetarchive: 6,
};

/**
 * Clean and normalize titles and creator names for key matching.
 * Strips special tags like [OFFICIAL VIDEO], (4K 60FPS), extra spaces, and special characters.
 */
export function normalizeString(str: string): string {
  if (!str) return '';

  return str
    .toLowerCase()
    .replace(/\[.*?\]|\(.*?\)/g, '') // remove text inside [] or ()
    .replace(/official\s*(music\s*)?video|hd|4k|1080p|audio|lyric\s*video|trailer/g, '') // strip common video tags
    .replace(/[^a-z0-9\s]/g, '') // remove special characters
    .replace(/\s+/g, ' ') // replace multiple spaces with single space
    .trim();
}

/**
 * Generates a unique deduplication string key for a video based on title and creator.
 */
export function getDedupeKey(title: string, creator: string): string {
  const normTitle = normalizeString(title);
  const normCreator = normalizeString(creator);
  return `${normTitle}:::${normCreator}`;
}

/**
 * Deduplicates an array of Videos and sorts them by provider priority and stream availability.
 */
export function deduplicateAndSortVideos(videos: Video[]): Video[] {
  const map = new Map<string, Video>();

  for (const video of videos) {
    const key = getDedupeKey(video.title, video.creator);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, video);
      continue;
    }

    // Rank: 1. Direct stream available > IFrame embed
    // 2. Higher provider priority
    const existingRank = PROVIDER_PRIORITY_MAP[existing.source] ?? 99;
    const currentRank = PROVIDER_PRIORITY_MAP[video.source] ?? 99;

    const existingHasDirect = Boolean(existing.directStreamUrl);
    const currentHasDirect = Boolean(video.directStreamUrl);

    if (currentHasDirect && !existingHasDirect) {
      map.set(key, video);
    } else if (currentHasDirect === existingHasDirect && currentRank < existingRank) {
      map.set(key, video);
    }
  }

  return Array.from(map.values());
}

/**
 * Converts a legacy CuratedVideo object into a canonical normalized Video DTO.
 */
export function toNormalizedVideo(curated: any): Video {
  const provider = (curated.provider || 'youtube') as VideoSource;
  const providerVideoId = curated.providerVideoId || curated.provider_video_id || curated.id;

  let embedUrl = curated.embedUrl;
  if (!embedUrl) {
    if (provider === 'youtube') embedUrl = `https://www.youtube.com/embed/${providerVideoId}?autoplay=1`;
    else if (provider === 'vimeo') embedUrl = `https://player.vimeo.com/video/${providerVideoId}?autoplay=1`;
    else if (provider === 'dailymotion') embedUrl = `https://www.dailymotion.com/embed/video/${providerVideoId}?autoplay=1`;
    else if (provider === 'twitch') embedUrl = `https://player.twitch.tv/?channel=${providerVideoId}`;
  }

  return {
    id: `${provider.slice(0, 2)}:${providerVideoId}`,
    source: provider,
    providerVideoId,
    title: curated.title || 'Untitled Video',
    description: curated.description || '',
    creator: curated.creator || curated.authorName || 'Curated Channel',
    thumbnailUrl: curated.thumbnailUrl || curated.thumbnail_url || '',
    embedUrl,
    durationMs: curated.durationMs || 180000,
    aspectRatio: curated.isShort ? '9:16' : '16:9',
    category: curated.category || 'General',
    tags: curated.tags || ['Curated'],
    safetyStatus: curated.safetyStatus || curated.safety_status || 'approved',
    isFullPlay: true,
    isDownloadable: false,
    addedAt: curated.addedAt || curated.added_at || new Date().toISOString(),
  };
}

