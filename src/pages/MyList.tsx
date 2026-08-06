import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CuratedVideo } from '../types';
import { VideoShelfRow } from '../components/video/VideoShelfRow';
import { Bookmark } from 'lucide-react';

interface MyListProps {
  videos: CuratedVideo[];
  savedVideoIds: string[];
  onSelectVideo: (video: CuratedVideo) => void;
  onToggleSave: (video: CuratedVideo) => void;
}

export const MyList: React.FC<MyListProps> = ({
  videos,
  savedVideoIds,
  onSelectVideo,
  onToggleSave,
}) => {
  const navigate = useNavigate();
  const savedVideosList = videos.filter((v) => savedVideoIds.includes(v.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-cozia-line pb-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">My Saved List</h1>
          <p className="text-xs text-cozia-ink-dim mt-1">Bookmarked curated videos for fast watching.</p>
        </div>
        <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-cozia-gold/20 text-cozia-gold">
          {savedVideosList.length} Saved
        </span>
      </div>

      {savedVideosList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-cozia-surface border border-cozia-line space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cozia-gold/10 text-cozia-gold mx-auto flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-medium">Your List is Empty</h2>
          <p className="text-xs text-cozia-ink-dim max-w-md mx-auto">
            Click the bookmark icon on any video card to save it to your personal list.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-cozia-gold text-cozia-bg text-xs font-semibold hover:bg-cozia-gold-dim transition-all"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <VideoShelfRow
          title="Your Saved Videos"
          videos={savedVideosList}
          onSelectVideo={onSelectVideo}
          onToggleSave={onToggleSave}
          savedVideoIds={savedVideoIds}
        />
      )}
    </div>
  );
};
