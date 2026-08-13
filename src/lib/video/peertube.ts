import { Video } from '../../types/video';

const DEFAULT_PEERTUBE_INSTANCES = [
  'https://framatube.org',
  'https://peertube.stream',
  'https://tube.opencloud.lu',
];

interface PeerTubeVideoPayload {
  id: number;
  uuid: string;
  name: string;
  category: { id: number; label: string };
  duration: number;
  views: number;
  likes: number;
  thumbnailPath: string;
  embedPath: string;
  account: {
    name: string;
    displayName: string;
    avatar?: { path: string };
  };
  channel: {
    name: string;
    displayName: string;
    avatar?: { path: string };
  };
  files?: Array<{ fileUrl: string; resolution: { id: number; label: string } }>;
  streamingPlaylists?: Array<{ playlistUrl: string }>;
}

export async function searchPeerTube(query: string, instance = DEFAULT_PEERTUBE_INSTANCES[0]): Promise<Video[]> {
  try {
    const url = `${instance}/api/v1/videos?search=${encodeURIComponent(query)}&count=12&sort=-createdAt`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = (await response.json()) as { data: PeerTubeVideoPayload[] };
    if (!data || !Array.isArray(data.data)) return [];

    return data.data.map((item) => parsePeerTubeVideo(item, instance));
  } catch {
    return [];
  }
}

export function parsePeerTubeVideo(item: PeerTubeVideoPayload, instance: string): Video {
  const directStreamUrl =
    item.streamingPlaylists?.[0]?.playlistUrl ||
    item.files?.[0]?.fileUrl ||
    undefined;

  const thumbnailUrl = item.thumbnailPath.startsWith('http')
    ? item.thumbnailPath
    : `${instance}${item.thumbnailPath}`;

  const embedUrl = item.embedPath.startsWith('http')
    ? item.embedPath
    : `${instance}${item.embedPath}`;

  return {
    id: `pt:${item.uuid}`,
    source: 'peertube',
    providerVideoId: item.uuid,
    title: item.name,
    description: `Published on PeerTube by ${item.account?.displayName || item.account?.name}`,
    creator: item.account?.displayName || item.account?.name || 'PeerTube Creator',
    creatorAvatarUrl: item.account?.avatar?.path
      ? (item.account.avatar.path.startsWith('http') ? item.account.avatar.path : `${instance}${item.account.avatar.path}`)
      : undefined,
    thumbnailUrl,
    directStreamUrl,
    embedUrl,
    durationMs: (item.duration || 0) * 1000,
    aspectRatio: '16:9',
    category: item.category?.label || 'General',
    tags: ['peertube', 'decentralized'],
    viewCount: item.views || 0,
    likeCount: item.likes || 0,
    isFullPlay: true,
    isDownloadable: true,
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  };
}
