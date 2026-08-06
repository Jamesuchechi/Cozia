import React, { useEffect, useState } from 'react';
import { CuratedVideo, VideoProvider } from '../types';
import { VideoGrid } from '../components/video/VideoGrid';
import { VideoShelfRow } from '../components/video/VideoShelfRow';
import { SHELVES, getShelfVideos } from '../lib/shelves';
import { getCommunityPopularVideos } from '../lib/social';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

interface HomeProps {
  videos: CuratedVideo[];
  loadingVideos: boolean;
  activeProvider: VideoProvider | 'all';
  activeCategory: string;
  savedVideoIds: string[];
  onSelectVideo: (video: CuratedVideo) => void;
  onToggleSave: (video: CuratedVideo) => void;
  onOpenPinModal: (mode: 'enter_pin' | 'set_pin') => void;
}

export const Home: React.FC<HomeProps> = ({
  videos,
  loadingVideos,
  activeProvider,
  activeCategory,
  savedVideoIds,
  onSelectVideo,
  onToggleSave,
  onOpenPinModal,
}) => {
  const { isKidsMode, profile } = useAuth();
  const [communityVideos, setCommunityVideos] = useState<CuratedVideo[]>([]);

  useEffect(() => {
    if (profile?.id) {
      loadCommunityPopular();
    }
  }, [profile?.id]);

  const loadCommunityPopular = async () => {
    if (!profile) return;
    const popular = await getCommunityPopularVideos(profile.id);
    setCommunityVideos(popular);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Kids Mode Banner */}
      {isKidsMode && (
        <div className="p-3.5 rounded-2xl bg-cozia-teal/15 border border-cozia-teal/30 text-cozia-teal text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Kids Mode Active — Browsing is restricted to family-approved content.</span>
          </div>
          <button
            onClick={() => onOpenPinModal('enter_pin')}
            className="px-3 py-1 rounded-lg bg-cozia-teal text-cozia-bg font-semibold hover:opacity-90 transition-all shrink-0"
          >
            Exit Kids Mode
          </button>
        </div>
      )}

      {/* Grid / Shelves */}
      {loadingVideos ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-56 rounded-2xl bg-cozia-surface animate-pulse border border-cozia-line" />
          ))}
        </div>
      ) : activeCategory !== 'All' || activeProvider !== 'all' ? (
        <VideoGrid
          title={`${activeProvider !== 'all' ? activeProvider.toUpperCase() : ''} ${
            activeCategory !== 'All' ? activeCategory : 'Curated Videos'
          }`}
          videos={videos}
          onSelectVideo={onSelectVideo}
          onToggleSave={onToggleSave}
          savedVideoIds={savedVideoIds}
        />
      ) : (
        <div className="space-y-10">
          <VideoGrid
            title="Recommended For You"
            videos={videos}
            onSelectVideo={onSelectVideo}
            onToggleSave={onToggleSave}
            savedVideoIds={savedVideoIds}
          />

          {communityVideos.length > 0 && (
            <VideoShelfRow
              title="Popular in your community"
              videos={communityVideos}
              onSelectVideo={onSelectVideo}
              onToggleSave={onToggleSave}
              savedVideoIds={savedVideoIds}
            />
          )}

          {SHELVES.map((shelf) => {
            const shelfVideos = getShelfVideos(shelf.id, videos);
            if (shelfVideos.length === 0) return null;
            return (
              <VideoShelfRow
                key={shelf.id}
                title={shelf.title}
                videos={shelfVideos}
                onSelectVideo={onSelectVideo}
                onToggleSave={onToggleSave}
                savedVideoIds={savedVideoIds}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
