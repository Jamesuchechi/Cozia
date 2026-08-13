import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Video, QualityOption } from '../types/video';

interface VideoPlayerState {
  currentVideo: Video | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  quality: QualityOption;
  aspectRatio: '16:9' | '9:16' | '4:3';
  queue: Video[];
  queueIndex: number;
  isShuffle: boolean;
  isRepeat: boolean;
  isPictureInPicture: boolean;
  watchPartyRoomId: string | null;
  isHost: boolean;

  // Actions
  playVideo: (video: Video, queue?: Video[]) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  seekTo: (timeSeconds: number) => void;
  setCurrentTime: (timeSeconds: number) => void;
  setDuration: (durationSeconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: QualityOption) => void;
  setAspectRatio: (aspect: '16:9' | '9:16' | '4:3') => void;
  nextVideo: () => void;
  previousVideo: () => void;
  addToQueue: (video: Video) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setWatchPartyRoom: (roomId: string | null, isHost?: boolean) => void;
  closePlayer: () => void;
}

export const useVideoPlayerStore = create<VideoPlayerState>()(
  persist(
    (set, get) => ({
      currentVideo: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1.0,
      isMuted: false,
      playbackRate: 1.0,
      quality: 'auto',
      aspectRatio: '16:9',
      queue: [],
      queueIndex: 0,
      isShuffle: false,
      isRepeat: false,
      isPictureInPicture: false,
      watchPartyRoomId: null,
      isHost: false,

      playVideo: (video, queue) => {
        const newQueue = queue || get().queue;
        const foundIndex = newQueue.findIndex((v) => v.id === video.id);
        const queueIndex = foundIndex !== -1 ? foundIndex : 0;

        set({
          currentVideo: video,
          isPlaying: true,
          currentTime: 0,
          aspectRatio: video.aspectRatio || '16:9',
          queue: newQueue.length > 0 ? newQueue : [video],
          queueIndex,
        });
      },

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      seekTo: (timeSeconds) => set({ currentTime: timeSeconds }),
      setCurrentTime: (timeSeconds) => set({ currentTime: timeSeconds }),
      setDuration: (durationSeconds) => set({ duration: durationSeconds }),
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      setQuality: (quality) => set({ quality }),
      setAspectRatio: (aspectRatio) => set({ aspectRatio }),

      nextVideo: () => {
        const { queue, queueIndex, isRepeat } = get();
        if (queue.length === 0) return;

        let nextIdx = queueIndex + 1;
        if (nextIdx >= queue.length) {
          if (isRepeat) nextIdx = 0;
          else {
            set({ isPlaying: false });
            return;
          }
        }

        const nextVid = queue[nextIdx];
        if (nextVid) {
          set({
            currentVideo: nextVid,
            queueIndex: nextIdx,
            currentTime: 0,
            isPlaying: true,
          });
        }
      },

      previousVideo: () => {
        const { queue, queueIndex } = get();
        if (queue.length === 0) return;

        const prevIdx = queueIndex - 1 < 0 ? 0 : queueIndex - 1;
        const prevVid = queue[prevIdx];
        if (prevVid) {
          set({
            currentVideo: prevVid,
            queueIndex: prevIdx,
            currentTime: 0,
            isPlaying: true,
          });
        }
      },

      addToQueue: (video) => set((state) => ({ queue: [...state.queue, video] })),

      reorderQueue: (fromIndex, toIndex) =>
        set((state) => {
          const updated = [...state.queue];
          const [removed] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, removed);
          return { queue: updated };
        }),

      clearQueue: () => set({ queue: [], queueIndex: 0 }),
      setWatchPartyRoom: (roomId, isHost = false) => set({ watchPartyRoomId: roomId, isHost }),
      closePlayer: () => set({ currentVideo: null, isPlaying: false, currentTime: 0 }),
    }),
    {
      name: 'cozia-video-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        quality: state.quality,
        playbackRate: state.playbackRate,
      }),
    }
  )
);
