import React, { useState } from 'react';
import { CuratedVideo } from '../../types';
import { Bookmark, Check, ShieldCheck, Radio, CheckCircle2, MoreVertical } from 'lucide-react';

interface VideoCardProps {
  video: CuratedVideo;
  onSelectVideo?: (video: CuratedVideo) => void;
  onToggleSave?: (video: CuratedVideo) => void;
  isSaved?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelectVideo,
  onToggleSave,
  isSaved = false,
}) => {
  const [saved, setSaved] = useState<boolean>(isSaved);

  const getProviderBadge = () => {
    switch (video.provider) {
      case 'youtube':
        return <span className="bg-red-600 text-white">YouTube</span>;
      case 'vimeo':
        return <span className="bg-sky-500 text-white">Vimeo</span>;
      case 'dailymotion':
        return <span className="bg-blue-600 text-white">Dailymotion</span>;
      case 'twitch':
        return <span className="bg-purple-600 text-white">Twitch</span>;
      default:
        return <span className="bg-cozia-gold text-cozia-bg">Cozia</span>;
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onToggleSave) {
      onToggleSave(video);
    }
  };

  return (
    <div
      onClick={() => onSelectVideo && onSelectVideo(video)}
      className="group relative cursor-pointer flex flex-col justify-between select-none"
    >
      {/* Thumbnail Container (16:9 YouTube aspect ratio with clean rounded corners) */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 group-hover:rounded-none transition-all duration-300 shadow-md">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Provider Tag Top-Right */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold shadow-md uppercase tracking-wider backdrop-blur-md">
          {getProviderBadge()}
        </div>

        {/* Duration / Live Badge Bottom-Right */}
        <div className="absolute bottom-2 right-2">
          {video.isLive ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white flex items-center gap-1 shadow-md animate-pulse">
              <Radio className="w-3 h-3" />
              <span>LIVE</span>
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-black/80 text-white backdrop-blur-md shadow-md">
              {video.duration || '3:45'}
            </span>
          )}
        </div>

        {/* Save Bookmark Button Top-Left */}
        <button
          onClick={handleSaveClick}
          aria-label={saved ? `Remove ${video.title} from list` : `Save ${video.title} to list`}
          className={`absolute top-2 left-2 p-1.5 rounded-xl border backdrop-blur-md transition-all shadow-md ${
            saved
              ? 'bg-cozia-gold text-cozia-bg border-cozia-gold'
              : 'bg-black/60 text-white/80 hover:text-white border-white/20 hover:bg-black/80'
          }`}
          title={saved ? 'Remove from My List' : 'Save to My List'}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Metadata Section Below Thumbnail (YouTube Layout) */}
      <div className="mt-3 flex items-start gap-3">
        {/* Creator Channel Avatar */}
        <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 overflow-hidden shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${video.providerVideoId}`}
            alt="Channel Avatar"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title, Channel, & Tags */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-sans text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-cozia-gold transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="truncate">Cozia {video.category}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-cozia-teal shrink-0" />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="px-1.5 py-0.5 rounded bg-neutral-800/80 text-cozia-gold font-medium">
              {video.category}
            </span>
            <span className="flex items-center gap-1 text-cozia-teal font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Family Safe</span>
            </span>
          </div>
        </div>

        {/* More Actions 3-dots */}
        <button
          onClick={handleSaveClick}
          aria-label={`More options for ${video.title}`}
          className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
          title="Save or Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
