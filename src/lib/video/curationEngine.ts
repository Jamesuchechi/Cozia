import { Video } from '../../types/video';
import { getCuratedVideos } from '../curation';
import { toNormalizedVideo } from './normalizer';
import { useUserStore } from '../../stores/userStore';

export interface CurationShelvesResult {
  heroFeatured: Video | null;
  trendingCharts: Video[];
  editorialTopics: Record<string, Video[]>;
  shortsMix: Video[];
  longformDocs: Video[];
  recommendedForYou: Video[];
}

/**
 * 4-Tier Video Curation Engine
 * Tier 1: Regional & Global Charts
 * Tier 2: Editorial & Topic Collections
 * Tier 3: Format & Aspect Ratio Mixes (Shorts vs Longform)
 * Tier 4: Algorithmic "For You" Personalization
 */
export async function getCuratedVideoShelves(_regionCode = 'US'): Promise<CurationShelvesResult> {

  // Fetch candidate videos from Supabase safety gate (returns approved items)
  const legacyCurated = await getCuratedVideos('all', 'All');
  const normalizedPool: Video[] = legacyCurated.map((item) => toNormalizedVideo(item));

  // 1. Tier 1: Trending & Top Charts
  const trendingCharts = normalizedPool
    .filter((v) => v.safetyStatus === 'approved')
    .slice(0, 10);

  // Hero Featured (First top trending item)
  const heroFeatured = trendingCharts.length > 0 ? trendingCharts[0] : null;

  // 2. Tier 2: Editorial Topic Collections
  const editorialTopics: Record<string, Video[]> = {
    'Tech & Coding Deep Dives': normalizedPool.filter((v) =>
      v.category.toLowerCase().includes('tech') ||
      v.category.toLowerCase().includes('education') ||
      v.tags.some((t) => ['tech', 'coding', 'react', 'code'].includes(t.toLowerCase()))
    ),
    'Indie Cinema & Short Films': normalizedPool.filter((v) =>
      v.category.toLowerCase().includes('film') ||
      v.category.toLowerCase().includes('cinema') ||
      v.tags.some((t) => ['film', 'cinema', 'indie'].includes(t.toLowerCase()))
    ),
    'Gaming & Esports Highlights': normalizedPool.filter((v) =>
      v.category.toLowerCase().includes('gaming') ||
      v.tags.some((t) => ['gaming', 'esports', 'twitch'].includes(t.toLowerCase()))
    ),
    'Kids & Family Adventures': normalizedPool.filter((v) =>
      v.category.toLowerCase().includes('kids') ||
      v.category.toLowerCase().includes('family') ||
      v.tags.some((t) => ['kids', 'family', 'animation'].includes(t.toLowerCase()))
    ),
  };

  // 3. Tier 3: Format & Pacing Mixes (Shorts 9:16 vs Longform > 20m)
  const shortsMix = normalizedPool.filter(
    (v) => v.aspectRatio === '9:16' || v.durationMs < 240000 || v.tags.includes('short')
  );

  const longformDocs = normalizedPool.filter(
    (v) => v.durationMs > 1200000 || v.tags.includes('documentary') || v.tags.includes('longform')
  );

  // 4. Tier 4: Algorithmic "For You" Personalization
  const userAffinity = useUserStore.getState().categoryAffinity || {};
  const recommendedForYou = [...normalizedPool].sort((a, b) => {
    const scoreA = userAffinity[a.category] || 0;
    const scoreB = userAffinity[b.category] || 0;
    return scoreB - scoreA;
  }).slice(0, 10);

  return {
    heroFeatured,
    trendingCharts,
    editorialTopics,
    shortsMix,
    longformDocs,
    recommendedForYou,
  };
}
