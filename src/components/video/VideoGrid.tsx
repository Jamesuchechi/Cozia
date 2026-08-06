import React from 'react';
import { CuratedVideo } from '../../types';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  title?: string;
  videos: CuratedVideo[];
  onSelectVideo?: (video: CuratedVideo) => void;
  onToggleSave?: (video: CuratedVideo) => void;
  savedVideoIds?: string[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  title,
  videos,
  onSelectVideo,
  onToggleSave,
  savedVideoIds = [],
}) => {
  if (videos.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-cozia-surface border border-cozia-line text-cozia-ink-dim">
        <p className="text-sm font-medium">No videos found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-cozia-ink flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xs font-mono text-cozia-ink-faint">({videos.length})</span>
        </h2>
      )}

      {/* YouTube Style Multi-Column Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onSelectVideo={onSelectVideo}
            onToggleSave={onToggleSave}
            isSaved={savedVideoIds.includes(video.id)}
          />
        ))}
      </div>
    </div>
  );
};
