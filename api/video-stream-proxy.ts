/**
 * Multi-Tier Video Stream Extraction Serverless Proxy Endpoint
 * Resolves direct streaming URLs (MP4 / HLS .m3u8) using a 4-tier waterfall resolution matrix:
 * Tier 1: Cobalt API Cluster
 * Tier 2: Invidious API Cluster
 * Tier 3: Piped API Cluster
 * Tier 4: Fallback IFrame Embed URL
 */

const COBALT_INSTANCES = [
  'https://api.cobalt.tools',
  'https://cobalt.q13.cz',
  'https://cobalt.ray.sc',
];

const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://inv.tux.pizza',
  'https://invidious.drgns.space',
];

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacydev.net',
];

export default async function handler(req: any, res: any) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const videoId = (req.query?.videoId || req.body?.videoId || '') as string;
  const provider = (req.query?.provider || req.body?.provider || 'youtube') as string;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId parameter is required' });
  }

  if (provider === 'youtube') {
    // 1. Tier 1: Cobalt API Cluster
    for (const instance of COBALT_INSTANCES) {
      try {
        const response = await fetch(`${instance}/`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: `https://www.youtube.com/watch?v=${videoId}`,
            videoQuality: '1080',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            return res.status(200).json({
              url: data.url,
              tier: 1,
              source: 'cobalt',
              format: 'mp4',
            });
          }
        }
      } catch (err) {
        console.warn(`[StreamProxy] Cobalt instance ${instance} failed:`, err);
      }
    }

    // 2. Tier 2: Invidious API Cluster
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const response = await fetch(`${instance}/api/v1/videos/${videoId}`);
        if (response.ok) {
          const data = await response.json();
          const directUrl = data.hlsUrl || data.adaptiveFormats?.[0]?.url || data.formatStreams?.[0]?.url;
          if (directUrl) {
            return res.status(200).json({
              url: directUrl,
              tier: 2,
              source: 'invidious',
              format: data.hlsUrl ? 'm3u8' : 'mp4',
            });
          }
        }
      } catch (err) {
        console.warn(`[StreamProxy] Invidious instance ${instance} failed:`, err);
      }
    }

    // 3. Tier 3: Piped API Cluster
    for (const instance of PIPED_INSTANCES) {
      try {
        const response = await fetch(`${instance}/streams/${videoId}`);
        if (response.ok) {
          const data = await response.json();
          const directUrl = data.hls || data.videoStreams?.[0]?.url;
          if (directUrl) {
            return res.status(200).json({
              url: directUrl,
              tier: 3,
              source: 'piped',
              format: data.hls ? 'm3u8' : 'mp4',
            });
          }
        }
      } catch (err) {
        console.warn(`[StreamProxy] Piped instance ${instance} failed:`, err);
      }
    }
  }

  // 4. Tier 4: Fallback to Embedded IFrame link
  return res.status(200).json({
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
    tier: 4,
    source: 'iframe-fallback',
  });
}
