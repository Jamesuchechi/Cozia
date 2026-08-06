import { forwardRef } from 'react';
import { extractTwitchTarget } from '../../lib/twitch';

interface TwitchPlayerProps {
  videoIdOrChannel: string;
  autoPlay?: boolean;
}

export const TwitchPlayer = forwardRef<HTMLIFrameElement, TwitchPlayerProps>(
  ({ videoIdOrChannel, autoPlay = true }, ref) => {
    const target = extractTwitchTarget(videoIdOrChannel) || { type: 'channel' as const, id: videoIdOrChannel };
    const parentHostname = typeof window !== 'undefined' ? window.location.hostname || 'localhost' : 'localhost';

    const getEmbedSrc = () => {
      switch (target.type) {
        case 'clip':
          return `https://clips.twitch.tv/embed?clip=${target.id}&parent=${parentHostname}&autoplay=${autoPlay}`;
        case 'video':
          return `https://player.twitch.tv/?video=${target.id}&parent=${parentHostname}&autoplay=${autoPlay}`;
        case 'channel':
        default:
          return `https://player.twitch.tv/?channel=${target.id}&parent=${parentHostname}&autoplay=${autoPlay}`;
      }
    };

    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-cozia-surface-2 shadow-2xl border border-cozia-line">
        <iframe
          ref={ref}
          src={getEmbedSrc()}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen"
          title="Twitch Embed Player"
        />
      </div>
    );
  }
);

TwitchPlayer.displayName = 'TwitchPlayer';
