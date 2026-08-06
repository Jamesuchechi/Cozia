import React from 'react';
import { CuratedVideo } from '../../types';
import { UniversalVideoPlayer } from './UniversalVideoPlayer';
import { X, ShieldCheck } from 'lucide-react';

interface PlayerModalProps {
  video: CuratedVideo | null;
  allVideos?: CuratedVideo[];
  onClose: () => void;
  onSelectVideo?: (video: CuratedVideo) => void;
  onToggleSave?: (video: CuratedVideo) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  video,
  allVideos = [],
  onClose,
  onSelectVideo,
  onToggleSave,
}) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-cozia-bg/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-cozia-surface border border-cozia-line rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cozia-line bg-cozia-surface-2/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cozia-gold text-cozia-bg uppercase">
              {video.provider}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-cozia-teal/20 text-cozia-teal border border-cozia-teal/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Family Approved</span>
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal video player"
            className="p-2 rounded-xl text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface transition-all"
            title="Close player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Body Scroll Container */}
        <div className="overflow-y-auto p-6 flex-1">
          <UniversalVideoPlayer
            video={video}
            allVideos={allVideos}
            onSelectVideo={onSelectVideo}
            onToggleSave={onToggleSave}
          />
        </div>
      </div>
    </div>
  );
};
