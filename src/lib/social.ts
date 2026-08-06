import { supabase } from './supabase';
import { UserProfile, CuratedVideo } from '../types';
import { containsProfanityOrFlaggedKeywords } from './moderation';

export interface PostItem {
  id: string;
  authorId: string;
  author?: UserProfile;
  content: string;
  curatedVideoId?: string;
  curatedVideo?: CuratedVideo;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  authorId: string;
  author?: UserProfile;
  postId?: string;
  curatedVideoId?: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
  replies?: CommentItem[];
}

export interface ReactionItem {
  id: string;
  userId: string;
  targetType: 'post' | 'comment' | 'video';
  targetId: string;
  emoji: string;
  createdAt: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

// ------------------------------------------------------------
// 1. FOLLOWS
// ------------------------------------------------------------

export async function followUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
  if (!isUuid(followerId) || !isUuid(followingId)) {
    return { success: false, error: 'Invalid user ID format' };
  }
  try {
    const { error } = await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
  if (!isUuid(followerId) || !isUuid(followingId)) {
    return { success: false, error: 'Invalid user ID format' };
  }
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  if (!isUuid(followerId) || !isUuid(followingId)) return false;
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}

export async function getFollowers(userId: string): Promise<UserProfile[]> {
  if (!isUuid(userId)) return [];
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('profiles!follower_id(*)')
      .eq('following_id', userId);

    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.profiles.id,
      username: item.profiles.username,
      displayName: item.profiles.display_name,
      avatarUrl: item.profiles.avatar_url,
      bio: item.profiles.bio,
      createdAt: item.profiles.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getFollowing(userId: string): Promise<UserProfile[]> {
  if (!isUuid(userId)) return [];
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('profiles!following_id(*)')
      .eq('follower_id', userId);

    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.profiles.id,
      username: item.profiles.username,
      displayName: item.profiles.display_name,
      avatarUrl: item.profiles.avatar_url,
      bio: item.profiles.bio,
      createdAt: item.profiles.created_at,
    }));
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// 2. POSTS & SOCIAL FEED
// ------------------------------------------------------------

export async function createPost(
  authorId: string,
  content: string,
  curatedVideoId?: string
): Promise<{ success: boolean; post?: PostItem; error?: string }> {
  if (containsProfanityOrFlaggedKeywords(content)) {
    return { success: false, error: 'Post contains inappropriate content and was flagged by family safety.' };
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: authorId,
        content,
        curated_video_id: curatedVideoId || null,
      })
      .select('*, profiles(*), curated_videos(*)')
      .single();

    if (error) return { success: false, error: error.message };

    const post: PostItem = {
      id: data.id,
      authorId: data.author_id,
      author: data.profiles
        ? {
            id: data.profiles.id,
            username: data.profiles.username,
            displayName: data.profiles.display_name,
            avatarUrl: data.profiles.avatar_url,
            createdAt: data.profiles.created_at,
          }
        : undefined,
      content: data.content,
      curatedVideoId: data.curated_video_id,
      curatedVideo: data.curated_videos
        ? {
            id: data.curated_videos.id,
            provider: data.curated_videos.provider,
            providerVideoId: data.curated_videos.provider_video_id,
            title: data.curated_videos.title,
            description: data.curated_videos.description,
            thumbnailUrl: data.curated_videos.thumbnail_url,
            duration: data.curated_videos.duration,
            category: data.curated_videos.category,
            tags: data.curated_videos.tags || [],
            safetyStatus: data.curated_videos.safety_status,
            addedAt: data.curated_videos.added_at,
          }
        : undefined,
      likesCount: data.likes_count || 0,
      commentsCount: data.comments_count || 0,
      createdAt: data.created_at,
    };

    return { success: true, post };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function getPosts(followingUserIds?: string[]): Promise<PostItem[]> {
  try {
    let query = supabase
      .from('posts')
      .select('*, profiles(*), curated_videos(*)')
      .order('created_at', { ascending: false });

    if (followingUserIds && followingUserIds.length > 0) {
      query = query.in('author_id', followingUserIds);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      authorId: item.author_id,
      author: item.profiles
        ? {
            id: item.profiles.id,
            username: item.profiles.username,
            displayName: item.profiles.display_name,
            avatarUrl: item.profiles.avatar_url,
            createdAt: item.profiles.created_at,
          }
        : undefined,
      content: item.content,
      curatedVideoId: item.curated_video_id,
      curatedVideo: item.curated_videos
        ? {
            id: item.curated_videos.id,
            provider: item.curated_videos.provider,
            providerVideoId: item.curated_videos.provider_video_id,
            title: item.curated_videos.title,
            description: item.curated_videos.description,
            thumbnailUrl: item.curated_videos.thumbnail_url,
            duration: item.curated_videos.duration,
            category: item.curated_videos.category,
            tags: item.curated_videos.tags || [],
            safetyStatus: item.curated_videos.safety_status,
            addedAt: item.curated_videos.added_at,
          }
        : undefined,
      likesCount: item.likes_count || 0,
      commentsCount: item.comments_count || 0,
      createdAt: item.created_at,
    }));
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// 3. COMMENTS & THREADING
// ------------------------------------------------------------

export async function addComment(
  authorId: string,
  content: string,
  target: { postId?: string; curatedVideoId?: string; parentCommentId?: string }
): Promise<{ success: boolean; comment?: CommentItem; error?: string }> {
  if (containsProfanityOrFlaggedKeywords(content)) {
    return { success: false, error: 'Comment contains inappropriate content and was flagged by family safety.' };
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        author_id: authorId,
        content,
        post_id: target.postId || null,
        curated_video_id: target.curatedVideoId || null,
        parent_comment_id: target.parentCommentId || null,
      })
      .select('*, profiles(*)')
      .single();

    if (error) return { success: false, error: error.message };

    const comment: CommentItem = {
      id: data.id,
      authorId: data.author_id,
      author: data.profiles
        ? {
            id: data.profiles.id,
            username: data.profiles.username,
            displayName: data.profiles.display_name,
            avatarUrl: data.profiles.avatar_url,
            createdAt: data.profiles.created_at,
          }
        : undefined,
      postId: data.post_id,
      curatedVideoId: data.curated_video_id,
      parentCommentId: data.parent_comment_id,
      content: data.content,
      createdAt: data.created_at,
    };

    return { success: true, comment };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function getComments(target: { postId?: string; curatedVideoId?: string }): Promise<CommentItem[]> {
  try {
    let query = supabase.from('comments').select('*, profiles(*)').order('created_at', { ascending: true });

    if (target.postId) {
      query = query.eq('post_id', target.postId);
    } else if (target.curatedVideoId) {
      query = query.eq('curated_video_id', target.curatedVideoId);
    } else {
      return [];
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const allComments: CommentItem[] = data.map((item: any) => ({
      id: item.id,
      authorId: item.author_id,
      author: item.profiles
        ? {
            id: item.profiles.id,
            username: item.profiles.username,
            displayName: item.profiles.display_name,
            avatarUrl: item.profiles.avatar_url,
            createdAt: item.profiles.created_at,
          }
        : undefined,
      postId: item.post_id,
      curatedVideoId: item.curated_video_id,
      parentCommentId: item.parent_comment_id,
      content: item.content,
      createdAt: item.created_at,
      replies: [],
    }));

    // Nest replies into parent comments
    const topLevel: CommentItem[] = [];
    const map = new Map<string, CommentItem>();

    allComments.forEach((c) => map.set(c.id, c));
    allComments.forEach((c) => {
      if (c.parentCommentId && map.has(c.parentCommentId)) {
        map.get(c.parentCommentId)!.replies?.push(c);
      } else {
        topLevel.push(c);
      }
    });

    return topLevel;
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// 4. REACTIONS
// ------------------------------------------------------------

export async function addReaction(
  userId: string,
  targetType: 'post' | 'comment' | 'video',
  targetId: string,
  emoji: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('reactions').upsert({
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      emoji,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function removeReaction(
  userId: string,
  targetType: 'post' | 'comment' | 'video',
  targetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function getReactions(
  targetType: 'post' | 'comment' | 'video',
  targetId: string
): Promise<ReactionItem[]> {
  try {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      targetType: item.target_type,
      targetId: item.target_id,
      emoji: item.emoji,
      createdAt: item.created_at,
    }));
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// 5. COMMUNITY POPULAR SHELF (Followed User Activity Aggregation)
// ------------------------------------------------------------

export async function getCommunityPopularVideos(userId: string): Promise<CuratedVideo[]> {
  try {
    // 1. Get IDs of users followed by userId
    const following = await getFollowing(userId);
    const followingIds = following.map((u) => u.id);
    if (followingIds.length === 0) return [];

    // 2. Fetch recent video reactions & saved videos from followed users
    const { data: reactionData } = await supabase
      .from('reactions')
      .select('target_id')
      .eq('target_type', 'video')
      .in('user_id', followingIds);

    const { data: savedData } = await supabase
      .from('user_saved_videos')
      .select('curated_video_id')
      .in('user_id', followingIds);

    const videoIdCounts = new Map<string, number>();

    reactionData?.forEach((r) => {
      videoIdCounts.set(r.target_id, (videoIdCounts.get(r.target_id) || 0) + 1);
    });

    savedData?.forEach((s) => {
      videoIdCounts.set(s.curated_video_id, (videoIdCounts.get(s.curated_video_id) || 0) + 1);
    });

    if (videoIdCounts.size === 0) return [];

    const sortedVideoIds = Array.from(videoIdCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const { data: videoRows } = await supabase
      .from('curated_videos')
      .select('*')
      .in('id', sortedVideoIds)
      .eq('safety_status', 'approved');

    if (!videoRows) return [];

    return videoRows.map((item: any) => ({
      id: item.id,
      provider: item.provider,
      providerVideoId: item.provider_video_id,
      title: item.title,
      description: item.description,
      thumbnailUrl: item.thumbnail_url,
      duration: item.duration,
      category: item.category,
      tags: item.tags || [],
      safetyStatus: item.safety_status,
      addedBy: item.added_by,
      addedAt: item.added_at,
      isLive: item.is_live,
    }));
  } catch {
    return [];
  }
}
