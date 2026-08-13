import { Video } from '../../types/video';
import { getCuratedVideos } from '../curation';
import { toNormalizedVideo } from './normalizer';
import { getRegionalTopCharts } from './curation/charts';
import { getEditorialTopicCollections, EditorialTopicCollections } from './curation/editorial';
import { getFormatMixes } from './curation/formats';
import { getPersonalizedForYouFeed } from './curation/personalization';

export interface CurationShelvesResult {
  heroFeatured: Video | null;
  trendingCharts: Video[];
  editorialTopics: EditorialTopicCollections;
  shortsMix: Video[];
  longformDocs: Video[];
  recommendedForYou: Video[];
}

/**
 * Master 4-Tier Video Curation Engine
 * Tier 1: Regional & Global Top Charts
 * Tier 2: Editorial & Topic Collections
 * Tier 3: Format & Aspect Ratio Mixes (Shorts 9:16 vs Longform)
 * Tier 4: Algorithmic "For You" Personalization
 */
export async function getCuratedVideoShelves(regionCode = 'US'): Promise<CurationShelvesResult> {
  const legacyCurated = await getCuratedVideos('all', 'All');
  const normalizedPool: Video[] = legacyCurated.map((item) => toNormalizedVideo(item));

  // Tier 1: Top Charts
  const trendingCharts = getRegionalTopCharts(normalizedPool, regionCode);
  const heroFeatured = trendingCharts.length > 0 ? trendingCharts[0] : null;

  // Tier 2: Editorial Topics
  const editorialTopics = getEditorialTopicCollections(normalizedPool);

  // Tier 3: Format Mixes
  const { shortsAndClips, longformDocs } = getFormatMixes(normalizedPool);

  // Tier 4: Personalized "For You"
  const recommendedForYou = getPersonalizedForYouFeed(normalizedPool);

  return {
    heroFeatured,
    trendingCharts,
    editorialTopics,
    shortsMix: shortsAndClips,
    longformDocs,
    recommendedForYou,
  };
}
