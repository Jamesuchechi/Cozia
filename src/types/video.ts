export type VideoSource =
  | 'youtube'
  | 'vimeo'
  | 'twitch'
  | 'dailymotion'
  | 'peertube'
  | 'internetarchive';

export type VideoFormat = 'horizontal' | 'vertical' | 'square';

export type QualityOption = '1080p' | '720p' | '480p' | '360p' | 'auto';

export type SafetyStatus = 'pending' | 'approved' | 'rejected';

export interface Video {
  id: string; // Unified unique identifier e.g. "yt:v123", "pt:456"
  source: VideoSource;
  providerVideoId: string;
  title: string;
  description: string;
  creator: string;
  creatorId?: string;
  creatorAvatarUrl?: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  directStreamUrl?: string; // Direct MP4 / M3U8 HLS stream URL if available
  embedUrl?: string; // IFrame embed fallback URL
  durationMs: number;
  aspectRatio: '16:9' | '9:16' | '4:3';
  category: string;
  tags: string[];
  viewCount?: number;
  likeCount?: number;
  isLive?: boolean;
  isFullPlay: boolean;
  isDownloadable: boolean;
  safetyStatus: SafetyStatus;
  addedBy?: string;
  addedAt: string;
}

export interface VideoChannel {
  id: string;
  source: VideoSource;
  channelName: string;
  channelId: string;
  avatarUrl?: string;
  bannerUrl?: string;
  description?: string;
  subscriberCount?: number;
  verified?: boolean;
}

export interface VideoPlaylist {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  itemCount: number;
  videos: Video[];
  creatorName: string;
  createdAt: string;
}

export interface SearchOptions {
  query: string;
  sources?: VideoSource[];
  category?: string;
  limit?: number;
  regionCode?: string;
}
