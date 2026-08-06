/**
 * Vimeo API & oEmbed Service Layer
 */

export interface FetchedVimeoMetadata {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  authorName: string;
  duration?: string;
}

/**
 * Extract Vimeo Video ID from various URL formats or raw ID string.
 * Supports:
 * - https://vimeo.com/76979871
 * - https://vimeo.com/channels/staffpicks/76979871
 * - https://player.vimeo.com/video/76979871
 * - Raw numeric ID
 */
export function extractVimeoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Raw numeric ID format (e.g. 76979871)
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Standard Vimeo URL format
  const match = trimmed.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]+\/videos\/|album\/\d+\/video\/|video\/|)|player\.vimeo\.com\/video\/)(\d+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Convert seconds number to human readable MM:SS or HH:MM:SS format
 */
export function formatSecondsToTime(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds)) return '3:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return `${minutes}:${formattedSeconds}`;
}

/**
 * Fetch Vimeo Video Metadata via Vimeo v3 API (if token provided) or Vimeo oEmbed fallback.
 */
export async function fetchVimeoMetadata(urlOrId: string): Promise<FetchedVimeoMetadata> {
  const videoId = extractVimeoId(urlOrId);
  if (!videoId) {
    throw new Error('Invalid Vimeo URL or Video ID');
  }

  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
  const accessToken = (env.VITE_VIMEO_PERSONAL_ACCESS_TOKEN as string) || '';

  // 1. Try Vimeo API v3 with Personal Access Token if configured
  if (accessToken && accessToken !== 'your-vimeo-access-token') {
    try {
      const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          videoId,
          title: data.name || 'Vimeo Short Film',
          description: data.description || 'Curated high-quality Vimeo video.',
          thumbnailUrl:
            data.pictures?.sizes?.[3]?.link ||
            data.pictures?.sizes?.[0]?.link ||
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
          authorName: data.user?.name || 'Vimeo Creator',
          duration: formatSecondsToTime(data.duration),
        };
      }
    } catch (err) {
      console.warn('Vimeo API v3 failed, falling back to oEmbed:', err);
    }
  }

  // 2. Fallback: Vimeo oEmbed endpoint (no token required)
  try {
    const embedUrl = `https://vimeo.com/${videoId}`;
    const oembedRes = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(embedUrl)}`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      return {
        videoId,
        title: data.title || 'Vimeo Video',
        description: data.description || `Curated Vimeo video by ${data.author_name || 'Vimeo Creator'}`,
        thumbnailUrl: data.thumbnail_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
        authorName: data.author_name || 'Vimeo Creator',
        duration: formatSecondsToTime(data.duration),
      };
    }
  } catch (err) {
    console.warn('Vimeo oEmbed fallback warning:', err);
  }

  // 3. Final Fallback Mock
  return {
    videoId,
    title: `Vimeo Video (${videoId})`,
    description: 'Curated high-quality Vimeo production.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    authorName: 'Vimeo Filmmaker',
    duration: '3:45',
  };
}
