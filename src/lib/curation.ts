import { supabase } from './supabase';
import { CuratedVideo, ModerationItem, VideoProvider } from '../types';
import { LOCAL_INGESTED_VIDEOS } from './ingestion';

export const SEED_MODERATION_QUEUE: ModerationItem[] = [];

/**
 * Shuffle an array in-place using Fisher-Yates algorithm for catalog randomization on refresh.
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fetch curated videos from Supabase, applying randomized slice selection on refresh.
 */
export async function getCuratedVideos(
  providerFilter?: VideoProvider | 'all',
  categoryFilter?: string
): Promise<CuratedVideo[]> {
  try {
    let query = supabase.from('curated_videos').select('*').eq('safety_status', 'approved');

    if (providerFilter && providerFilter !== 'all') {
      query = query.eq('provider', providerFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase query error in getCuratedVideos:', error);
      throw error;
    }

    let videos: CuratedVideo[] = [];

    if (data && data.length > 0) {
      videos = data.map((item) => ({
        id: item.id,
        provider: item.provider as VideoProvider,
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
    }

    // Merge in-memory ingested videos if any exist
    for (const localVid of LOCAL_INGESTED_VIDEOS) {
      if (!videos.some((v) => v.provider === localVid.provider && v.providerVideoId === localVid.providerVideoId)) {
        videos.push(localVid);
      }
    }

    // Apply category filtering
    let filtered = videos.filter((v) => {
      if (providerFilter && providerFilter !== 'all' && v.provider !== providerFilter) return false;
      if (categoryFilter && categoryFilter !== 'All') {
        const matchCategory = v.category.toLowerCase() === categoryFilter.toLowerCase();
        const matchTag = v.tags.some((t) => t.toLowerCase() === categoryFilter.toLowerCase());
        if (!matchCategory && !matchTag) return false;
      }
      return true;
    });

    // Return randomized slice so feed changes on refresh
    return shuffleArray(filtered);
  } catch (err: any) {
    console.error('Failed to fetch curated videos:', err);
    return [];
  }
}

/**
 * Curate and publish a video into Supabase curated_videos table.
 * Returns success: false with the error message if the Supabase write fails.
 */
export async function curateVideo(video: CuratedVideo): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('curated_videos').upsert({
      provider: video.provider,
      provider_video_id: video.providerVideoId,
      title: video.title,
      description: video.description,
      thumbnail_url: video.thumbnailUrl,
      duration: video.duration,
      category: video.category,
      tags: video.tags,
      safety_status: 'approved',
      added_at: video.addedAt,
      is_live: video.isLive || false,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function submitNomination(
  submittingUserId: string,
  videoUrl: string,
  provider: VideoProvider,
  categorySuggestion: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('moderation_queue').insert({
      submitting_user_id: submittingUserId,
      video_url: videoUrl,
      provider,
      safety_status: 'pending',
      category_suggestion: categorySuggestion,
      notes,
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase insertion fallback to local state:', err);
    SEED_MODERATION_QUEUE.push({
      id: `mod-${Date.now()}`,
      submittingUserId,
      videoUrl,
      provider,
      safetyStatus: 'pending',
      categorySuggestion,
      notes,
      submittedAt: new Date().toISOString(),
    });
    return { success: true };
  }
}

/**
 * Fetch pending nominations for Moderation Queue
 */
export async function getModerationQueue(): Promise<ModerationItem[]> {
  try {
    const { data, error } = await supabase
      .from('moderation_queue')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('safety_status', 'pending');

    if (error || !data) return SEED_MODERATION_QUEUE;

    return data.map((item: any) => ({
      id: item.id,
      submittingUserId: item.submitting_user_id,
      submittingUser: item.profiles
        ? {
            id: item.submitting_user_id,
            username: item.profiles.username,
            displayName: item.profiles.display_name,
            avatarUrl: item.profiles.avatar_url,
            createdAt: new Date().toISOString(),
          }
        : undefined,
      videoUrl: item.video_url,
      provider: item.provider as VideoProvider,
      safetyStatus: item.safety_status,
      categorySuggestion: item.category_suggestion,
      notes: item.notes,
      submittedAt: item.submitted_at,
    }));
  } catch {
    return SEED_MODERATION_QUEUE;
  }
}
