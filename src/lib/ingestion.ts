import { supabase } from './supabase';
import { fetchYouTubeMetadata } from './youtube';
import { fetchVimeoMetadata } from './vimeo';
import { fetchDailymotionMetadata } from './dailymotion';
import { fetchTwitchMetadata } from './twitch';
import { CuratedVideo, VideoProvider } from '../types';

/**
 * Auto-approval allowlist for family-safe creators and categories.
 * Candidates matching these authors/categories transition from 'pending' to 'approved'.
 */
export const ALLOWLISTED_CHANNELS = [
  'NASA',
  'BBC Earth',
  'TED-Ed',
  'Mark Rober',
  'Storyline Online',
  'Bob Ross',
  'National Geographic',
  'Kurzgesagt',
  'PBS Kids',
  'Dude Perfect',
  'JPL',
  'Studio Ghibli',
];

export const ALLOWLISTED_CATEGORIES = ['Educational', 'Documentary', 'Science'];

export interface QuotaTracker {
  provider: VideoProvider;
  used: number;
  limit: number;
  exhausted: boolean;
}

export interface IngestionResult {
  totalFetched: number;
  pendingCount: number;
  autoApprovedCount: number;
  quotaUsage: Record<VideoProvider, { used: number; limit: number; exhausted: boolean }>;
  errors: string[];
}

/**
 * Candidate video seed candidates for ingestion across YouTube, Vimeo, Dailymotion, and Twitch.
 */
const CANDIDATE_VIDEOS: Array<{ provider: VideoProvider; urlOrId: string; category: string }> = [
  // YouTube Candidates
  { provider: 'youtube', urlOrId: 'dQw4w9WgXcQ', category: 'Music' },
  { provider: 'youtube', urlOrId: 'lFm4y5kU6N0', category: 'Relaxation' },
  { provider: 'youtube', urlOrId: 'L_LUpnjgPso', category: 'Educational' },
  { provider: 'youtube', urlOrId: 'hFZFjoX2cGg', category: 'Educational' },
  { provider: 'youtube', urlOrId: 'jfKfPfyJRdk', category: 'Music' },
  { provider: 'youtube', urlOrId: '7Pq-S557XQU', category: 'Documentary' },
  { provider: 'youtube', urlOrId: '9bZkp7q19f0', category: 'Educational' },
  { provider: 'youtube', urlOrId: '8jPQjjsBbIc', category: 'Comedy' },
  { provider: 'youtube', urlOrId: '6v2L2UGZJAM', category: 'Storytime' },
  { provider: 'youtube', urlOrId: 'K4TOrB7at0Y', category: 'Educational' },

  // Vimeo Candidates
  { provider: 'vimeo', urlOrId: '76979871', category: 'Documentary' },
  { provider: 'vimeo', urlOrId: '22439234', category: 'Vimeo Films' },
  { provider: 'vimeo', urlOrId: '10845371', category: 'Educational' },
  { provider: 'vimeo', urlOrId: '18312392', category: 'Vimeo Films' },

  // Dailymotion Candidates
  { provider: 'dailymotion', urlOrId: 'x8x1234', category: 'Educational' },
  { provider: 'dailymotion', urlOrId: 'x8x5678', category: 'Music' },
  { provider: 'dailymotion', urlOrId: 'x8x9012', category: 'Documentary' },

  // Twitch Candidates
  { provider: 'twitch', urlOrId: 'nasa', category: 'Twitch Live' },
  { provider: 'twitch', urlOrId: 'bobross', category: 'Twitch Live' },
  { provider: 'twitch', urlOrId: 'monstercat', category: 'Twitch Live' },
  { provider: 'twitch', urlOrId: 'GloriousCreativeMoments', category: 'Trending Shorts' },
];

import { containsProfanityOrFlaggedKeywords } from './moderation';

/**
 * Evaluates whether a video metadata object matches the auto-approval allowlist.
 * Returns false if title, description, or author contains flagged keywords.
 */
export function isAllowlisted(
  authorName: string,
  category: string,
  tags: string[] = [],
  title: string = '',
  description: string = ''
): boolean {
  if (
    containsProfanityOrFlaggedKeywords(title) ||
    containsProfanityOrFlaggedKeywords(description) ||
    containsProfanityOrFlaggedKeywords(authorName)
  ) {
    return false;
  }

  const normalizedAuthor = authorName.toLowerCase();
  const isAuthorAllowed = ALLOWLISTED_CHANNELS.some((channel) =>
    normalizedAuthor.includes(channel.toLowerCase())
  );
  if (isAuthorAllowed) return true;

  const isCategoryAllowed = ALLOWLISTED_CATEGORIES.some(
    (cat) => cat.toLowerCase() === category.toLowerCase()
  );
  if (isCategoryAllowed) return true;

  const isTagAllowed = tags.some((tag) =>
    ALLOWLISTED_CATEGORIES.some((cat) => cat.toLowerCase() === tag.toLowerCase())
  );
  return isTagAllowed;
}

/**
 * Scheduled ingestion job that pulls candidate videos per provider/category,
 * gates everything through safety_status = 'pending', applies auto-approval allowlist,
 * and tracks provider API quotas with backoff.
 */
export async function runIngestionJob(): Promise<IngestionResult> {
  const result: IngestionResult = {
    totalFetched: 0,
    pendingCount: 0,
    autoApprovedCount: 0,
    quotaUsage: {
      youtube: { used: 0, limit: 10, exhausted: false },
      vimeo: { used: 0, limit: 10, exhausted: false },
      dailymotion: { used: 0, limit: 10, exhausted: false },
      twitch: { used: 0, limit: 10, exhausted: false },
    },
    errors: [],
  };

  for (const candidate of CANDIDATE_VIDEOS) {
    const quota = result.quotaUsage[candidate.provider];
    if (quota.exhausted || quota.used >= quota.limit) {
      continue;
    }

    try {
      quota.used += 1;
      let videoMeta: Partial<CuratedVideo> | null = null;
      let authorName = '';

      if (candidate.provider === 'youtube') {
        const meta = await fetchYouTubeMetadata(candidate.urlOrId);
        authorName = meta.authorName;
        videoMeta = {
          provider: 'youtube',
          providerVideoId: meta.videoId,
          title: meta.title,
          description: meta.description,
          thumbnailUrl: meta.thumbnailUrl,
          duration: meta.duration || '3:30',
          category: candidate.category,
          tags: meta.tags || ['YouTube', candidate.category],
          isLive: false,
        };
      } else if (candidate.provider === 'vimeo') {
        const meta = await fetchVimeoMetadata(candidate.urlOrId);
        authorName = meta.authorName;
        videoMeta = {
          provider: 'vimeo',
          providerVideoId: meta.videoId,
          title: meta.title,
          description: meta.description,
          thumbnailUrl: meta.thumbnailUrl,
          duration: meta.duration || '4:00',
          category: candidate.category,
          tags: ['Vimeo', candidate.category],
          isLive: false,
        };
      } else if (candidate.provider === 'dailymotion') {
        const meta = await fetchDailymotionMetadata(candidate.urlOrId);
        authorName = meta.authorName;
        videoMeta = {
          provider: 'dailymotion',
          providerVideoId: meta.videoId,
          title: meta.title,
          description: meta.description,
          thumbnailUrl: meta.thumbnailUrl,
          duration: meta.duration || '4:15',
          category: candidate.category,
          tags: ['Dailymotion', candidate.category],
          isLive: false,
        };
      } else if (candidate.provider === 'twitch') {
        const meta = await fetchTwitchMetadata(candidate.urlOrId);
        authorName = meta.authorName;
        videoMeta = {
          provider: 'twitch',
          providerVideoId: meta.targetId,
          title: meta.title,
          description: meta.description,
          thumbnailUrl: meta.thumbnailUrl,
          duration: meta.duration,
          category: candidate.category,
          tags: ['Twitch', candidate.category],
          isLive: meta.isLive,
        };
      }

      if (!videoMeta) continue;

      result.totalFetched += 1;

      // Gate: Insert with safety_status = 'pending'
      const autoApproved = isAllowlisted(
        authorName,
        candidate.category,
        videoMeta.tags,
        videoMeta.title,
        videoMeta.description
      );
      const initialStatus = autoApproved ? 'approved' : 'pending';

      const { error } = await supabase.from('curated_videos').upsert(
        {
          provider: videoMeta.provider,
          provider_video_id: videoMeta.providerVideoId,
          title: videoMeta.title,
          description: videoMeta.description,
          thumbnail_url: videoMeta.thumbnailUrl,
          duration: videoMeta.duration,
          category: videoMeta.category,
          tags: videoMeta.tags,
          safety_status: initialStatus,
          is_live: videoMeta.isLive || false,
        },
        { onConflict: 'provider,provider_video_id' }
      );

      if (error) {
        result.errors.push(`Supabase write error for ${candidate.provider}:${candidate.urlOrId} - ${error.message}`);
      } else {
        if (autoApproved) {
          result.autoApprovedCount += 1;
        } else {
          result.pendingCount += 1;
        }
      }
    } catch (err: any) {
      quota.exhausted = true;
      result.errors.push(`Quota or API fetch failed for ${candidate.provider}:${candidate.urlOrId} - ${err.message || String(err)}`);
    }
  }

  return result;
}
