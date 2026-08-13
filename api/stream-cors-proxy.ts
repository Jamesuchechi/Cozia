/**
 * Serverless CORS & HTTP Range Request Stream Proxy
 * Relays stream requests with HTTP 206 Partial Content headers for native HTML5 video player seeking.
 */

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query?.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  try {
    const rangeHeader = req.headers?.range;
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: fetchHeaders,
    });

    if (!response.ok && response.status !== 206) {
      return res.status(response.status).json({ error: `Upstream media server returned ${response.status}` });
    }

    res.status(response.status);

    // Relay essential media streaming headers
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }

    return res.end();
  } catch (err: any) {
    console.error('[CORSStreamProxy] Proxy streaming error:', err);
    return res.status(500).json({ error: 'Failed to stream media payload' });
  }
}
