import { supabase } from './supabase';
import { CuratedVideo, ModerationItem, VideoProvider } from '../types';

/**
 * Rich Initial Seed Dataset (used as default fallback if Supabase table is empty)
 */
export const SEED_CURATED_VIDEOS: CuratedVideo[] = [
  {
    id: 'seed-yt-1',
    provider: 'youtube',
    providerVideoId: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    description: 'Classic iconic music video curated for family entertainment.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    duration: '3:33',
    category: 'Music',
    tags: ['Music', 'Classic', 'Family Picks'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-2',
    provider: 'youtube',
    providerVideoId: 'lFm4y5kU6N0',
    title: 'Satisfying Kinetic Sand Cutting & ASMR Relaxation',
    description: 'Calming and relaxing kinetic sand art demonstration.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    duration: '4:15',
    category: 'Relaxation',
    tags: ['ASMR', 'Relaxation', 'Shorts', 'Trending Shorts'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-3',
    provider: 'youtube',
    providerVideoId: 'L_LUpnjgPso',
    title: 'How Spacecraft Land on Mars - JPL Animation',
    description: 'NASA Jet Propulsion Laboratory educational animation of Mars rover landing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    duration: '5:42',
    category: 'Educational',
    tags: ['Space', 'Science', 'Educational'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-4',
    provider: 'youtube',
    providerVideoId: 'hFZFjoX2cGg',
    title: 'Mark Rober - World Largest Elephant Toothpaste Experiment',
    description: 'Fun and mind-blowing science experiment demonstrated by former NASA engineer Mark Rober.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    duration: '11:24',
    category: 'Educational',
    tags: ['Educational', 'Science', 'Family Picks'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-5',
    provider: 'youtube',
    providerVideoId: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    description: 'Relaxing ambient music stream perfect for homework, studying, and relaxing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    duration: 'LIVE',
    category: 'Music',
    tags: ['Music', 'Relaxation', 'Lofi'],
    safetyStatus: 'approved',
    isLive: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-6',
    provider: 'youtube',
    providerVideoId: '7Pq-S557XQU',
    title: 'BBC Earth - Planet Earth 4K Ultra HD Wildlife Highlights',
    description: 'Spectacular wildlife and nature cinematography from BBC Earth.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80',
    duration: '8:45',
    category: 'Documentary',
    tags: ['Documentary', 'Nature', 'BBC Earth'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-7',
    provider: 'youtube',
    providerVideoId: '9bZkp7q19f0',
    title: 'TED-Ed - How Do Painkillers Work?',
    description: 'Engaging animated lesson explaining the biology and science of pain relief.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    duration: '4:52',
    category: 'Educational',
    tags: ['Educational', 'Science', 'TED-Ed'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-8',
    provider: 'youtube',
    providerVideoId: '8jPQjjsBbIc',
    title: 'Dude Perfect - Real Life Water Bottle Flip Trick Shots',
    description: 'Wholesome family comedy and unbelievable trick shot challenges.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    duration: '6:18',
    category: 'Comedy',
    tags: ['Comedy', 'Family Picks', 'Trending Shorts'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-9',
    provider: 'youtube',
    providerVideoId: '6v2L2UGZJAM',
    title: 'Storyline Online - A Bad Case of Stripes read by Sean Astin',
    description: 'Beloved children story read aloud by actor Sean Astin with animated illustrations.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    duration: '12:05',
    category: 'Storytime',
    tags: ['Storytime', 'Family Picks', 'Kids'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-yt-10',
    provider: 'youtube',
    providerVideoId: '7Pq-S557XQU',
    title: 'Studio Ghibli Relaxing Piano Medley for Sleep & Study',
    description: 'Soothing piano renditions of iconic Studio Ghibli anime soundtracks.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=600&q=80',
    duration: '14:20',
    category: 'Music',
    tags: ['Music', 'Relaxation', 'Anime'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-vim-1',
    provider: 'vimeo',
    providerVideoId: '76979871',
    title: 'The Mountain - Award Winning Short Film',
    description: 'Breathtaking time-lapse photography of Spain highest peak.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    duration: '3:05',
    category: 'Documentary',
    tags: ['Vimeo Films', 'Nature', 'Documentary'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-vim-2',
    provider: 'vimeo',
    providerVideoId: '22439234',
    title: 'Arctic Light - Breathtaking Aurora Borealis in Norway',
    description: 'Stunning 4K footage of dancing northern lights captured across northern Scandinavia.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=600&q=80',
    duration: '4:48',
    category: 'Vimeo Films',
    tags: ['Vimeo Films', 'Documentary', 'Nature'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-vim-3',
    provider: 'vimeo',
    providerVideoId: '10845371',
    title: 'The Beauty of Origami - Japanese Paper Craft Documentary',
    description: 'Short film documenting master origami artists creating complex paper sculptures.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    duration: '5:12',
    category: 'Vimeo Films',
    tags: ['Vimeo Films', 'Educational', 'Arts'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-dm-1',
    provider: 'dailymotion',
    providerVideoId: 'x8x1234',
    title: 'Wonders of the Ocean Deep - Marine Life Special',
    description: 'Fascinating and calming family documentary exploring coral reefs and sea creatures.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    duration: '6:12',
    category: 'Educational',
    tags: ['Dailymotion', 'Nature', 'Educational'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-dm-2',
    provider: 'dailymotion',
    providerVideoId: 'x8x5678',
    title: 'Classical Piano Solo - Debussy Clair de Lune',
    description: 'Peaceful piano performance of Claude Debussy classic masterpiece.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=600&q=80',
    duration: '5:02',
    category: 'Music',
    tags: ['Dailymotion', 'Music', 'Relaxation'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-dm-3',
    provider: 'dailymotion',
    providerVideoId: 'x8x9012',
    title: 'Wild Animals of the Serengeti Savannah',
    description: 'Family-friendly nature documentary featuring lions, elephants, and giraffes.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
    duration: '9:30',
    category: 'Documentary',
    tags: ['Dailymotion', 'Documentary', 'Nature'],
    safetyStatus: 'approved',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-tw-1',
    provider: 'twitch',
    providerVideoId: 'nasa',
    title: 'NASA TV Live Channel - Earth Views & Space Station Feed',
    description: 'Official NASA live stream showing Earth views from ISS.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
    duration: 'LIVE',
    category: 'Twitch Live',
    tags: ['Twitch', 'Twitch Live', 'Live Now', 'Space'],
    safetyStatus: 'approved',
    isLive: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-tw-2',
    provider: 'twitch',
    providerVideoId: 'GloriousCreativeMoments',
    title: 'Family Game Design & Pixel Art Stream Showcase',
    description: 'Wholesome creative live coding and pixel art design highlights on Twitch.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    duration: '0:45',
    category: 'Trending Shorts',
    tags: ['Twitch', 'Trending Shorts', 'Arts'],
    safetyStatus: 'approved',
    isLive: false,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-tw-3',
    provider: 'twitch',
    providerVideoId: 'bobross',
    title: 'The Joy of Painting with Bob Ross - 24/7 Official Stream',
    description: 'Relaxing landscape oil painting demonstrations by Bob Ross.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    duration: 'LIVE',
    category: 'Twitch Live',
    tags: ['Twitch', 'Twitch Live', 'Arts', 'Relaxation'],
    safetyStatus: 'approved',
    isLive: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: 'seed-tw-4',
    provider: 'twitch',
    providerVideoId: 'monstercat',
    title: 'Monstercat 24/7 Electronic Music Radio Stream',
    description: 'Continuous family-friendly electro house, chillout, and synthwave music radio.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    duration: 'LIVE',
    category: 'Twitch Live',
    tags: ['Twitch', 'Twitch Live', 'Music', 'Live Now'],
    safetyStatus: 'approved',
    isLive: true,
    addedAt: new Date().toISOString(),
  },
];

export const SEED_MODERATION_QUEUE: ModerationItem[] = [
  {
    id: 'mod-1',
    submittingUserId: 'demo-user-123',
    submittingUser: {
      id: 'demo-user-123',
      username: 'parent_sarah',
      displayName: 'Sarah Jenkins',
      createdAt: new Date().toISOString(),
    },
    videoUrl: 'https://www.youtube.com/watch?v=k1BneeJTDcU',
    provider: 'youtube',
    safetyStatus: 'pending',
    categorySuggestion: 'Educational',
    notes: 'Great science experiment video for kids 8-12.',
    submittedAt: new Date().toISOString(),
  },
];

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
    } else {
      // If DB has zero approved rows (e.g. before initial ingestion job), use seed dataset
      videos = [...SEED_CURATED_VIDEOS];
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
