/**
 * Dailymotion API & oEmbed Service Layer
 */

export interface FetchedDailymotionMetadata {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  authorName: string;
  duration?: string;
}

/**
 * Extract Dailymotion Video ID from various URL formats or raw ID string.
 * Supports:
 * - https://www.dailymotion.com/video/x8x1234
 * - https://dailymotion.com/video/x8x1234
 * - https://dai.ly/x8x1234
 * - Raw alphanumeric ID (e.g. x8x1234)
 */
export function extractDailymotionId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Raw ID format (e.g. x8x1234 or x867v10)
  if (/^[a-zA-Z0-9]+$/.test(trimmed) && !trimmed.includes('.') && !trimmed.includes('/')) {
    return trimmed;
  }

  // dai.ly short link format
  const shortMatch = trimmed.match(/dai\.ly\/([a-zA-Z0-9]+)/);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }

  // Standard Dailymotion URL format (video/x...)
  const match = trimmed.match(/(?:dailymotion\.com\/(?:video|embed\/video)\/)([a-zA-Z0-9]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Convert seconds number to human readable MM:SS or HH:MM:SS format
 */
export function formatSecondsToTime(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds)) return '4:00';
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
 * Fetch Dailymotion Video Metadata via Dailymotion Public Data API with oEmbed fallback.
 */
export async function fetchDailymotionMetadata(urlOrId: string): Promise<FetchedDailymotionMetadata> {
  const videoId = extractDailymotionId(urlOrId);
  if (!videoId) {
    throw new Error('Invalid Dailymotion URL or Video ID');
  }

  // 1. Try Dailymotion Public Data API
  try {
    const fields = 'id,title,description,thumbnail_720_url,thumbnail_480_url,thumbnail_url,duration,owner.username,owner.screenname';
    const response = await fetch(`https://api.dailymotion.com/video/${videoId}?fields=${fields}`);

    if (response.ok) {
      const data = await response.json();
      return {
        videoId,
        title: data.title || 'Dailymotion Video',
        description: data.description || 'Curated high-quality Dailymotion video.',
        thumbnailUrl:
          data.thumbnail_720_url ||
          data.thumbnail_480_url ||
          data.thumbnail_url ||
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        authorName: data['owner.screenname'] || data['owner.username'] || 'Dailymotion Creator',
        duration: formatSecondsToTime(data.duration),
      };
    }
  } catch (err) {
    console.warn('Dailymotion Public Data API failed, falling back to oEmbed:', err);
  }

  // 2. Fallback: Dailymotion oEmbed endpoint
  try {
    const embedUrl = `https://www.dailymotion.com/video/${videoId}`;
    const oembedRes = await fetch(`https://www.dailymotion.com/services/oembed?url=${encodeURIComponent(embedUrl)}&format=json`);
    if (oembedRes.ok) {
      const text = await oembedRes.text();
      if (text.startsWith('{')) {
        const data = JSON.parse(text);
        return {
          videoId,
          title: data.title || 'Dailymotion Video',
          description: data.description || `Curated Dailymotion video by ${data.author_name || 'Dailymotion Creator'}`,
          thumbnailUrl: data.thumbnail_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
          authorName: data.author_name || 'Dailymotion Creator',
          duration: formatSecondsToTime(data.duration),
        };
      }
    }
  } catch (err) {
    console.warn('Dailymotion oEmbed fallback warning:', err);
  }

  // 3. Final Fallback Mock
  return {
    videoId,
    title: `Dailymotion Video (${videoId})`,
    description: 'Curated high-quality family video from Dailymotion.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    authorName: 'Dailymotion Creator',
    duration: '4:15',
  };
}
