import React from 'react';

interface DailymotionPlayerProps {
  videoId: string;
  autoPlay?: boolean;
}

export const DailymotionPlayer: React.FC<DailymotionPlayerProps> = ({ videoId, autoPlay = true }) => {
  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-cozia-surface-2 shadow-2xl border border-cozia-line">
      <iframe
        src={`https://www.dailymotion.com/embed/video/${videoId}?autoplay=${autoPlay ? 1 : 0}&ui-highlight=e5a93b`}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Dailymotion Video Player"
      />
    </div>
  );
};
