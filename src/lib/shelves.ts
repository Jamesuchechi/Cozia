import { CuratedVideo } from '../types';

export interface ShelfDefinition {
  id: string;
  title: string;
  description?: string;
  filter: (video: CuratedVideo) => boolean;
}

export const SHELVES: ShelfDefinition[] = [
  {
    id: 'family-picks',
    title: 'Trending Family Picks',
    description: 'Wholesome entertainment for all ages',
    filter: (v) => v.category === 'Family Picks' || v.category === 'Music',
  },
  {
    id: 'shorts-clips',
    title: 'Trending Shorts & Clips',
    description: 'Bite-sized short clips and relaxation videos',
    filter: (v) => v.category === 'Relaxation' || (v.tags && v.tags.includes('Shorts')),
  },
  {
    id: 'educational',
    title: 'Educational & Science Discoveries',
    description: 'Science, history, and interactive lessons',
    filter: (v) => v.category === 'Educational' || (v.tags && v.tags.includes('Science')),
  },
  {
    id: 'vimeo-films',
    title: 'Vimeo Short Films & Documentaries',
    description: 'Award-winning independent short cinema',
    filter: (v) => v.provider === 'vimeo' || v.category === 'Documentary',
  },
  {
    id: 'twitch-live',
    title: 'Live Now on Twitch',
    description: 'Verified family-friendly live streams',
    filter: (v) => v.provider === 'twitch' || Boolean(v.isLive),
  },
];

export function getShelfVideos(shelfId: string, videos: CuratedVideo[]): CuratedVideo[] {
  const shelf = SHELVES.find((s) => s.id === shelfId);
  if (!shelf) return videos;
  const filtered = videos.filter(shelf.filter);
  return filtered.length > 0 ? filtered : videos;
}
