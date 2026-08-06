import React, { useRef } from 'react';
import { CuratedVideo } from '../../types';
import { VideoCard } from './VideoCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoShelfRowProps {
  title: string;
  videos: CuratedVideo[];
  onSelectVideo: (video: CuratedVideo) => void;
  onToggleSave: (video: CuratedVideo) => void;
  savedVideoIds: string[];
}

export const VideoShelfRow: React.FC<VideoShelfRowProps> = ({
  title,
  videos,
  onSelectVideo,
  onToggleSave,
  savedVideoIds,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!videos || videos.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-3 relative group my-6">
      {/* MovieBox Style Row Header (Title + More > link) */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-serif text-lg sm:text-xl font-medium tracking-tight text-cozia-ink flex items-center gap-2">
          <span>{title}</span>
        </h2>

        <button className="text-xs font-semibold text-cozia-ink-dim hover:text-cozia-gold transition-colors flex items-center gap-1 group/more">
          <span>More</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/more:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* MovieBox Style Circular Navigation Arrow Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 border border-cozia-line text-cozia-ink opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-2xl hover:bg-cozia-gold hover:text-cozia-bg hover:border-cozia-gold"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 border border-cozia-line text-cozia-ink opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-2xl hover:bg-cozia-gold hover:text-cozia-bg hover:border-cozia-gold"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Horizontal Scroll Container */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video) => (
          <div key={video.id} className="w-64 sm:w-72 shrink-0">
            <VideoCard
              video={video}
              onSelectVideo={onSelectVideo}
              onToggleSave={onToggleSave}
              isSaved={savedVideoIds.includes(video.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
