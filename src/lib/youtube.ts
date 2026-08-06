/**
 * YouTube API Helper & oEmbed Fallback Service
 */

export interface FetchedYouTubeMetadata {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  authorName: string;
  duration?: string;
  tags?: string[];
  isShort?: boolean;
}

/**
 * Extract YouTube Video ID from various URL formats or raw ID string.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-char ID
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Raw 11-char ID format
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // standard watch URL
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  return null;
}

/**
 * Convert ISO 8601 duration (e.g. PT15M33S or PT1H2M10S) to human readable MM:SS or HH:MM:SS
 */
export function formatIsoDuration(isoDuration: string): string {
  if (!isoDuration) return '0:00';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return `${minutes}:${formattedSeconds}`;
}

/**
 * Fetch YouTube Video Metadata via Data API v3 (if key provided) or oEmbed fallback.
 */
export async function fetchYouTubeMetadata(urlOrId: string): Promise<FetchedYouTubeMetadata> {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) {
    throw new Error('Invalid YouTube URL or Video ID');
  }

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  // 1. Try YouTube Data API v3 if API key is configured
  if (apiKey && apiKey !== 'your-youtube-api-key') {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const snippet = item.snippet;
          const contentDetails = item.contentDetails;

          const durationFormatted = formatIsoDuration(contentDetails.duration || '');

          return {
            videoId,
            title: snippet.title,
            description: snippet.description,
            thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            authorName: snippet.channelTitle,
            duration: durationFormatted,
            tags: snippet.tags || [],
            isShort: urlOrId.includes('/shorts/'),
          };
        }
      }
    } catch (err) {
      console.warn('YouTube API v3 failed, falling back to oEmbed:', err);
    }
  }

  // 2. Fallback: YouTube oEmbed endpoint (no API key required)
  try {
    const embedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(embedUrl)}`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      if (data.title) {
        return {
          videoId,
          title: data.title,
          description: `Curated YouTube video by ${data.author_name || 'YouTube Creator'}`,
          thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          authorName: data.author_name || 'YouTube Channel',
          duration: '3:45', // Default estimate when using oEmbed
          tags: ['Family Friendly', 'Curated'],
          isShort: urlOrId.includes('/shorts/'),
        };
      }
    }
  } catch (err) {
    console.warn('YouTube oEmbed fallback warning:', err);
  }

  // 3. Fallback mock metadata generator if network request fails
  return {
    videoId,
    title: `YouTube Video (${videoId})`,
    description: 'Curated family-friendly YouTube content.',
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    authorName: 'YouTube Creator',
    duration: '4:20',
    tags: ['Curated', 'YouTube'],
    isShort: urlOrId.includes('/shorts/'),
  };
}
