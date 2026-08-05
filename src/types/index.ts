export type SafetyStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CuratedVideo {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration?: string;
  category: string;
  tags: string[];
  safetyStatus: SafetyStatus;
  addedBy: string;
  addedAt: string;
}

export interface ShelfRow {
  id: string;
  title: string;
  slug: string;
  description?: string;
  videoIds: string[];
  order: number;
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
