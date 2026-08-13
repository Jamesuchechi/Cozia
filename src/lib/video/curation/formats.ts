import { Video } from '../../../types/video';

export function getFormatMixes(pool: Video[]) {
  const approved = pool.filter((v) => v.safetyStatus === 'approved');

  const shortsAndClips = approved.filter(
    (v) => v.aspectRatio === '9:16' || (v.durationMs > 0 && v.durationMs <= 240000) || v.tags.includes('Shorts')
  );

  const longformDocs = approved.filter(
    (v) => v.durationMs >= 1200000 || v.tags.includes('Documentary') || v.tags.includes('Longform')
  );

  return {
    shortsAndClips,
    longformDocs,
  };
}
