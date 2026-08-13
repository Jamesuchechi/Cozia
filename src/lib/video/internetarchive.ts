import { Video } from '../../types/video';

interface InternetArchiveDoc {
  identifier: string;
  title?: string;
  description?: string;
  creator?: string;
  year?: string;
  downloads?: number;
  mediatype?: string;
}

export async function searchInternetArchive(query: string): Promise<Video[]> {
  try {
    const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
      query
    )}+AND+mediatype:movies&fl[]=identifier,title,description,creator,year,downloads&sort[]=downloads+desc&rows=12&page=1&output=json`;

    const response = await fetch(searchUrl);
    if (!response.ok) return [];

    const data = await response.json();
    const docs: InternetArchiveDoc[] = data?.response?.docs || [];

    return docs.map((doc) => parseInternetArchiveDoc(doc));
  } catch {
    return [];
  }
}

export function parseInternetArchiveDoc(doc: InternetArchiveDoc): Video {
  const id = doc.identifier;
  const title = doc.title || id;
  const creator = doc.creator || 'Internet Archive';
  const thumbnailUrl = `https://archive.org/services/img/${id}`;
  const directStreamUrl = `https://archive.org/download/${id}/${id}.mp4`;
  const embedUrl = `https://archive.org/embed/${id}`;

  return {
    id: `ia:${id}`,
    source: 'internetarchive',
    providerVideoId: id,
    title,
    description: doc.description || `Public Domain Media from Internet Archive (${doc.year || 'Archive'})`,
    creator,
    thumbnailUrl,
    directStreamUrl,
    embedUrl,
    durationMs: 0, // Duration fetched on media load
    aspectRatio: '16:9',
    category: 'Archive',
    tags: ['internetarchive', 'publicdomain', 'classic'],
    viewCount: doc.downloads || 0,
    isFullPlay: true,
    isDownloadable: true,
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  };
}
