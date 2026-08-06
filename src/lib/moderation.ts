import { supabase } from './supabase';

const BANNED_KEYWORDS = [
  'nsfw',
  'explicit',
  'violence',
  'abuse',
  'hate',
  'scam',
  'phishing',
  'gambling',
  'casino',
  'profanity',
  'vulgar',
];

export interface ReportItem {
  id: string;
  submitterId?: string;
  targetType: 'post' | 'comment' | 'video';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface ModerationActionItem {
  id: string;
  actorId?: string;
  targetType: 'post' | 'comment' | 'video' | 'nomination';
  targetId: string;
  action: 'approved' | 'rejected' | 'flagged' | 'deleted' | 'dismissed';
  notes?: string;
  createdAt: string;
}

/**
 * Basic auto-flagging keyword filter for posts, comments, and ingested metadata.
 */
export function containsProfanityOrFlaggedKeywords(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_KEYWORDS.some((word) => lower.includes(word));
}

/**
 * Submit a report against a post, comment, or video.
 */
export async function submitReport(
  submitterId: string,
  targetType: 'post' | 'comment' | 'video',
  targetId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('reports').insert({
      submitter_id: submitterId,
      target_type: targetType,
      target_id: targetId,
      reason,
      status: 'pending',
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Log a moderation decision into the audit log table.
 */
export async function logModerationAction(
  actorId: string,
  targetType: 'post' | 'comment' | 'video' | 'nomination',
  targetId: string,
  action: 'approved' | 'rejected' | 'flagged' | 'deleted' | 'dismissed',
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('moderation_actions').insert({
      actor_id: actorId,
      target_type: targetType,
      target_id: targetId,
      action,
      notes: notes || null,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch read-only moderation audit action history.
 */
export async function getModerationActions(): Promise<ModerationActionItem[]> {
  try {
    const { data, error } = await supabase
      .from('moderation_actions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      actorId: item.actor_id,
      targetType: item.target_type,
      targetId: item.target_id,
      action: item.action,
      notes: item.notes,
      createdAt: item.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch pending ingested candidate videos from curated_videos table (safety_status = 'pending').
 */
export async function getPendingIngestedVideos() {
  try {
    const { data, error } = await supabase
      .from('curated_videos')
      .select('*')
      .eq('safety_status', 'pending');

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
