/**
 * Twitch Integration & API Service Layer (Live Streams, VODs, & Clips)
 */

export interface FetchedTwitchMetadata {
  targetType: 'channel' | 'clip' | 'video';
  targetId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  authorName: string;
  duration: string;
  isLive: boolean;
}

/**
 * Extract Twitch Target Type and ID from URL or raw input.
 * Supports:
 * - https://www.twitch.tv/nasa (channel/live)
 * - https://www.twitch.tv/videos/12345678 (VOD video)
 * - https://clips.twitch.tv/GloriousSlug (Clip)
 * - https://www.twitch.tv/channel/clip/GloriousSlug (Clip)
 * - Raw channel name (e.g. nasa)
 */
export function extractTwitchTarget(urlOrId: string): { type: 'channel' | 'clip' | 'video'; id: string } | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // 1. Clips: clips.twitch.tv/Slug or twitch.tv/creator/clip/Slug
  const clipShortMatch = trimmed.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/);
  if (clipShortMatch && clipShortMatch[1]) {
    return { type: 'clip', id: clipShortMatch[1] };
  }
  const clipLongMatch = trimmed.match(/twitch\.tv\/[^\/]+\/clip\/([a-zA-Z0-9_-]+)/);
  if (clipLongMatch && clipLongMatch[1]) {
    return { type: 'clip', id: clipLongMatch[1] };
  }

  // 2. Videos / VODs: twitch.tv/videos/123456
  const videoMatch = trimmed.match(/twitch\.tv\/videos\/(\d+)/);
  if (videoMatch && videoMatch[1]) {
    return { type: 'video', id: videoMatch[1] };
  }

  // 3. Channels: twitch.tv/channel_name
  const channelMatch = trimmed.match(/(?:twitch\.tv\/)([a-zA-Z0-9_]+)/);
  if (channelMatch && channelMatch[1] && !['directory', 'downloads', 'p'].includes(channelMatch[1].toLowerCase())) {
    return { type: 'channel', id: channelMatch[1] };
  }

  // 4. Plain raw channel handle (alphanumeric with underscores)
  if (/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { type: 'channel', id: trimmed };
  }

  return null;
}

/**
 * Fetch Twitch Stream, Video, or Clip Metadata via oEmbed endpoints & fallbacks.
 */
export async function fetchTwitchMetadata(urlOrId: string): Promise<FetchedTwitchMetadata> {
  const target = extractTwitchTarget(urlOrId);
  if (!target) {
    throw new Error('Invalid Twitch URL or Channel Name');
  }

  // Construct target URL for oEmbed query
  let targetUrl = `https://www.twitch.tv/${target.id}`;
  if (target.type === 'clip') {
    targetUrl = `https://clips.twitch.tv/${target.id}`;
  } else if (target.type === 'video') {
    targetUrl = `https://www.twitch.tv/videos/${target.id}`;
  }

  // 1. Try Twitch oEmbed API (no client id required for oEmbed metadata)
  try {
    const oembedRes = await fetch(`https://id.twitch.tv/oauth2/oembed?url=${encodeURIComponent(targetUrl)}`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      const isClip = target.type === 'clip';
      return {
        targetType: target.type,
        targetId: target.id,
        title: data.title || `${data.author_name || target.id}'s Twitch Stream`,
        description: `Live Twitch stream from ${data.author_name || target.id} on Cozia.`,
        thumbnailUrl:
          data.thumbnail_url ||
          'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
        authorName: data.author_name || target.id,
        duration: isClip ? '0:45' : 'LIVE',
        isLive: !isClip,
      };
    }
  } catch (err) {
    console.warn('Twitch oEmbed fallback warning:', err);
  }

  // 2. Fallback Metadata Mock
  const isClip = target.type === 'clip';
  const capitalId = target.id.charAt(0).toUpperCase() + target.id.slice(1);

  return {
    targetType: target.type,
    targetId: target.id,
    title: isClip ? `Viral Twitch Clip - ${capitalId}` : `${capitalId} Live Stream`,
    description: `Curated Twitch ${isClip ? 'clip' : 'live channel'} for family viewing on Cozia.`,
    thumbnailUrl: isClip
      ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
    authorName: capitalId,
    duration: isClip ? '0:30' : 'LIVE',
    isLive: !isClip,
  };
}
