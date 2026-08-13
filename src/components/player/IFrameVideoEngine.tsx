import React, { useRef, useEffect } from 'react';
import { Video } from '../../types/video';
import { VimeoPlayer } from './VimeoPlayer';
import { DailymotionPlayer } from './DailymotionPlayer';
import { TwitchPlayer } from './TwitchPlayer';
import { useVideoPlayerStore } from '../../stores/videoPlayerStore';

interface IFrameVideoEngineProps {
  video: Video;
}

export const IFrameVideoEngine: React.FC<IFrameVideoEngineProps> = ({ video }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { isPlaying, currentTime } = useVideoPlayerStore();

  // Listen for iframe postMessage commands
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    try {
      if (video.source === 'youtube') {
        const command = isPlaying ? 'playVideo' : 'pauseVideo';
        win.postMessage(JSON.stringify({ event: 'command', func: command, args: '' }), '*');
      } else if (video.source === 'vimeo') {
        const method = isPlaying ? 'play' : 'pause';
        win.postMessage(JSON.stringify({ method }), '*');
      }
    } catch {
      // Ignore cross-origin postMessage warnings
    }
  }, [isPlaying, currentTime, video.source]);

  switch (video.source) {
    case 'youtube':
      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-cozia-surface-2 shadow-2xl border border-cozia-line">
          <iframe
            ref={iframeRef}
            src={video.embedUrl || `https://www.youtube.com/embed/${video.providerVideoId}?enablejsapi=1&autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>
      );

    case 'vimeo':
      return <VimeoPlayer ref={iframeRef} videoId={video.providerVideoId} autoPlay={true} />;

    case 'dailymotion':
      return <DailymotionPlayer ref={iframeRef} videoId={video.providerVideoId} autoPlay={true} />;

    case 'twitch':
      return <TwitchPlayer ref={iframeRef} videoIdOrChannel={video.providerVideoId} autoPlay={true} />;

    default:
      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-cozia-surface-2 shadow-2xl border border-cozia-line flex items-center justify-center">
          <iframe
            ref={iframeRef}
            src={video.embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            title={video.title}
          />
        </div>
      );
  }
};
