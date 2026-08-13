import React, { useRef, useEffect, useState } from 'react';
import { useVideoPlayerStore } from '../../stores/videoPlayerStore';

interface NativeVideoEngineProps {
  src: string;
  poster?: string;
  onErrorFallback?: () => void;
}

export const NativeVideoEngine: React.FC<NativeVideoEngineProps> = ({ src, poster, onErrorFallback }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const { isPlaying, volume, isMuted, playbackRate, setCurrentTime, setDuration, setIsPlaying, nextVideo } =
    useVideoPlayerStore();

  // Sync isPlaying state with DOM element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Sync volume and playback rate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
    video.playbackRate = playbackRate;
  }, [volume, isMuted, playbackRate]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleError = () => {
    console.warn('[NativeVideoEngine] Native video error encountered, triggering Engine B fallback');
    onErrorFallback?.();
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-cozia-surface-2 shadow-2xl border border-cozia-line flex items-center justify-center group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={nextVideo}
        onError={handleError}
        playsInline
        className="w-full h-full object-contain"
      />

      {isBuffering && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-4 border-cozia-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
