import React from 'react';
import { CuratedVideo } from '../../types';
import { Play, Plus, Check, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  video: CuratedVideo | null;
  onPlay: (video: CuratedVideo) => void;
  onToggleSave: (video: CuratedVideo) => void;
  isSaved: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ video, onPlay, onToggleSave, isSaved }) => {
  if (!video) return null;

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-3xl overflow-hidden bg-cozia-surface border border-cozia-line shadow-2xl group my-2">
      {/* Background Image with Ambient Overlay */}
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 group-hover:scale-100 transition-transform duration-1000"
      />

      {/* Gradients for readability & Netflix warmth */}
      <div className="absolute inset-0 bg-gradient-to-t from-cozia-bg via-cozia-bg/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cozia-bg/90 via-cozia-bg/40 to-transparent" />

      {/* Content Container */}
      <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 max-w-3xl space-y-4 z-10 text-left">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-cozia-gold text-cozia-bg font-bold font-mono uppercase tracking-wider shadow-md">
            COZIA SPOTLIGHT
          </span>
          <span className="px-2.5 py-1 rounded-md bg-cozia-surface-2/80 backdrop-blur-md border border-cozia-line text-cozia-gold font-semibold uppercase">
            {video.provider}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-cozia-teal/20 backdrop-blur-md border border-cozia-teal/30 text-cozia-teal font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Family Approved</span>
          </span>
          <span className="text-cozia-ink-dim font-mono">{video.duration}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-cozia-ink tracking-tight leading-tight line-clamp-2 drop-shadow-md">
          {video.title}
        </h1>

        {/* Synopsis */}
        <p className="text-cozia-ink-dim text-xs sm:text-sm font-sans line-clamp-3 leading-relaxed max-w-2xl">
          {video.description || 'Watch this hand-picked, family-safe video curated for quality entertainment.'}
        </p>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => onPlay(video)}
            className="px-7 py-3.5 rounded-xl bg-cozia-gold text-cozia-bg font-bold text-sm hover:bg-cozia-gold-dim transition-all shadow-xl shadow-cozia-gold/20 flex items-center gap-2.5 transform hover:scale-105"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Watch Now</span>
          </button>

          <button
            onClick={() => onToggleSave(video)}
            className={`px-6 py-3.5 rounded-xl border font-semibold text-sm transition-all flex items-center gap-2 backdrop-blur-md ${
              isSaved
                ? 'bg-cozia-surface-2 text-cozia-gold border-cozia-gold'
                : 'bg-cozia-surface/80 text-cozia-ink border-cozia-line hover:border-cozia-gold'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isSaved ? 'In My List' : 'My List'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
