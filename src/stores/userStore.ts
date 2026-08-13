import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Video } from '../types/video';

interface UserState {
  watchHistory: Video[];
  savedVideos: Video[];
  likedVideoIds: string[];
  categoryAffinity: Record<string, number>;

  // Actions
  recordWatch: (video: Video) => void;
  toggleSaveVideo: (video: Video) => void;
  toggleLikeVideo: (videoId: string) => void;
  clearHistory: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      watchHistory: [],
      savedVideos: [],
      likedVideoIds: [],
      categoryAffinity: {},

      recordWatch: (video) => {
        const { watchHistory, categoryAffinity } = get();

        // Update category affinity weight
        const category = video.category || 'General';
        const currentScore = categoryAffinity[category] || 0;
        const updatedAffinity = { ...categoryAffinity, [category]: currentScore + 1 };

        // Deduplicate history, keeping most recent at top
        const filteredHistory = watchHistory.filter((v) => v.id !== video.id);
        const updatedHistory = [video, ...filteredHistory].slice(0, 100); // keep top 100

        set({ watchHistory: updatedHistory, categoryAffinity: updatedAffinity });
      },

      toggleSaveVideo: (video) => {
        const { savedVideos } = get();
        const exists = savedVideos.some((v) => v.id === video.id);

        if (exists) {
          set({ savedVideos: savedVideos.filter((v) => v.id !== video.id) });
        } else {
          set({ savedVideos: [video, ...savedVideos] });
        }
      },

      toggleLikeVideo: (videoId) => {
        const { likedVideoIds } = get();
        if (likedVideoIds.includes(videoId)) {
          set({ likedVideoIds: likedVideoIds.filter((id) => id !== videoId) });
        } else {
          set({ likedVideoIds: [...likedVideoIds, videoId] });
        }
      },

      clearHistory: () => set({ watchHistory: [], categoryAffinity: {} }),
    }),
    {
      name: 'cozia-user-affinity-storage',
    }
  )
);
