import React from 'react';

interface VimeoPlayerProps {
  videoId: string;
  autoPlay?: boolean;
}

export const VimeoPlayer: React.FC<VimeoPlayerProps> = ({ videoId, autoPlay = true }) => {
  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-cozia-surface-2 shadow-2xl border border-cozia-line">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}&title=0&byline=0&portrait=0`}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo Video Player"
      />
    </div>
  );
};
