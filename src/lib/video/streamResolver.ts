import { Video } from '../../types/video';

export interface StreamResolutionResult {
  streamUrl?: string;
  embedUrl?: string;
  tier: number;
  source: string;
  format?: 'mp4' | 'm3u8';
}

/**
 * Client-Side Stream Resolver Utility
 * Queries the Serverless Multi-Tier Stream Extraction Proxy (/api/video-stream-proxy)
 * to resolve direct MP4/HLS streaming links or fallback embed URLs for a given Video DTO.
 */
export async function resolveVideoStream(video: Video): Promise<StreamResolutionResult> {
  // If video already has a direct stream URL (e.g. PeerTube, Internet Archive), return immediately
  if (video.directStreamUrl) {
    return {
      streamUrl: video.directStreamUrl,
      tier: 0,
      source: 'direct',
      format: video.directStreamUrl.includes('.m3u8') ? 'm3u8' : 'mp4',
    };
  }

  try {
    const res = await fetch(`/api/video-stream-proxy?videoId=${encodeURIComponent(video.providerVideoId)}&provider=${video.source}`);
    if (res.ok) {
      const data = await res.json();
      return {
        streamUrl: data.url,
        embedUrl: data.embedUrl || video.embedUrl,
        tier: data.tier || 4,
        source: data.source || 'serverless-proxy',
        format: data.format,
      };
    }
  } catch (err) {
    console.warn('[StreamResolver] Stream extraction proxy warning:', err);
  }

  return {
    embedUrl: video.embedUrl || `https://www.youtube.com/embed/${video.providerVideoId}?autoplay=1`,
    tier: 4,
    source: 'iframe-fallback',
  };
}
