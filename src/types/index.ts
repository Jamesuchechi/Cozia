export * from './video';

export type VideoProvider = 'youtube' | 'vimeo' | 'dailymotion' | 'twitch' | 'peertube' | 'internetarchive';
export type SafetyStatus = 'pending' | 'approved' | 'rejected';

export type UserRole = 'user' | 'curator' | 'admin';


export interface SocialLinks {
  twitter?: string;
  youtube?: string;
  github?: string;
  website?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  websiteUrl?: string;
  socialLinks?: SocialLinks;
  isKidMode?: boolean;
  parentalPinHash?: string;
  role?: UserRole;
  createdAt: string;
  updatedAt?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface CuratedVideo {
  id: string;
  provider: VideoProvider;
  providerVideoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration?: string;
  category: string;
  tags: string[];
  safetyStatus: SafetyStatus;
  addedBy?: string;
  addedAt: string;
  isLive?: boolean;
}

export interface ShelfRow {
  id: string;
  title: string;
  slug: string;
  description?: string;
  filterType?: string;
  videoIds: string[];
  displayOrder: number;
  isKidsApproved?: boolean;
}

export interface SavedVideo {
  id: string;
  userId: string;
  curatedVideoId: string;
  curatedVideo?: CuratedVideo;
  savedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author?: UserProfile;
  content: string;
  curatedVideoId?: string;
  curatedVideo?: CuratedVideo;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface Comment {
  id: string;
  postId?: string;
  curatedVideoId?: string;
  authorId: string;
  author?: UserProfile;
  content: string;
  createdAt: string;
}

export interface ModerationItem {
  id: string;
  submittingUserId?: string;
  submittingUser?: UserProfile;
  videoUrl: string;
  provider: VideoProvider;
  safetyStatus: SafetyStatus;
  categorySuggestion?: string;
  notes?: string;
  submittedAt: string;
}
