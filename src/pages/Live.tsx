import React from 'react';
import { CuratedVideo } from '../types';
import { VideoShelfRow } from '../components/video/VideoShelfRow';
import { getShelfVideos } from '../lib/shelves';
import { Radio } from 'lucide-react';

interface LiveProps {
  videos: CuratedVideo[];
  savedVideoIds: string[];
  onSelectVideo: (video: CuratedVideo) => void;
  onToggleSave: (video: CuratedVideo) => void;
}

export const Live: React.FC<LiveProps> = ({
  videos,
  savedVideoIds,
  onSelectVideo,
  onToggleSave,
}) => {
  const twitchLiveStreams = getShelfVideos('twitch-live', videos);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-8 text-center rounded-3xl bg-cozia-surface border border-cozia-line space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
          <Radio className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-medium">Twitch Live Broadcasts</h2>
        <p className="text-xs text-cozia-ink-dim max-w-md mx-auto">
          Watch live streams from verified family-friendly Twitch broadcasters.
        </p>
      </div>

      {twitchLiveStreams.length > 0 && (
        <VideoShelfRow
          title="Live Now"
          videos={twitchLiveStreams}
          onSelectVideo={onSelectVideo}
          onToggleSave={onToggleSave}
          savedVideoIds={savedVideoIds}
        />
      )}
    </div>
  );
};
