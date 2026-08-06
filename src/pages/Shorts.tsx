import React from 'react';
import { CuratedVideo } from '../types';
import { VideoShelfRow } from '../components/video/VideoShelfRow';
import { getShelfVideos } from '../lib/shelves';

interface ShortsProps {
  videos: CuratedVideo[];
  savedVideoIds: string[];
  onSelectVideo: (video: CuratedVideo) => void;
  onToggleSave: (video: CuratedVideo) => void;
}

export const Shorts: React.FC<ShortsProps> = ({
  videos,
  savedVideoIds,
  onSelectVideo,
  onToggleSave,
}) => {
  const shortsVideos = getShelfVideos('shorts-clips', videos);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-cozia-line pb-4">
        <h1 className="font-serif text-2xl font-medium tracking-tight">Trending Shorts & Clips</h1>
        <span className="text-xs font-mono text-cozia-ink-faint">Short-form videos</span>
      </div>
      <VideoShelfRow
        title="Top Shorts"
        videos={shortsVideos.length > 0 ? shortsVideos : videos}
        onSelectVideo={onSelectVideo}
        onToggleSave={onToggleSave}
        savedVideoIds={savedVideoIds}
      />
    </div>
  );
};
