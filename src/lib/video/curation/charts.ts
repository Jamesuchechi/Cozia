import { Video } from '../../../types/video';

export function getRegionalTopCharts(pool: Video[], _regionCode = 'US'): Video[] {

  // Filter for approved safety status and rank by view count & freshness
  return pool
    .filter((v) => v.safetyStatus === 'approved')
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 12);
}
