import { supabase } from '../src/lib/supabase';
import { SEED_CURATED_VIDEOS } from './seed-data';

async function seed() {
  console.log('Seeding initial curated videos into Supabase...');

  for (const video of SEED_CURATED_VIDEOS) {
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
      console.warn(`Failed to seed ${video.title}:`, error.message);
    } else {
      console.log(`✅ Seeded ${video.provider}:${video.providerVideoId}`);
    }
  }

  console.log('Seeding completed!');
}

seed();
