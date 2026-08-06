import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { AuthModal } from './components/auth/AuthModal';
import { ParentalPinModal } from './components/auth/ParentalPinModal';
import { NominateModal } from './components/curation/NominateModal';
import { VideoGrid } from './components/video/VideoGrid';
import { VideoShelfRow } from './components/video/VideoShelfRow';
import { PlayerModal } from './components/player/PlayerModal';
import { PublicProfile } from './pages/PublicProfile';
import { EditProfile } from './pages/EditProfile';
import { ModerationQueue } from './pages/ModerationQueue';
import { CuratedVideo, VideoProvider } from './types';
import { getCuratedVideos } from './lib/curation';
import { ShieldCheck, Radio, Bookmark } from 'lucide-react';

function AppContent() {
  const { profile, isKidsMode } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeProvider, setActiveProvider] = useState<VideoProvider | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const [videos, setVideos] = useState<CuratedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<CuratedVideo | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isNominateOpen, setIsNominateOpen] = useState<boolean>(false);
  const [pinModalState, setPinModalState] = useState<{ isOpen: boolean; mode: 'enter_pin' | 'set_pin' }>({
    isOpen: false,
    mode: 'enter_pin',
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    loadVideos();
  }, [activeProvider, activeCategory]);

  const loadVideos = async () => {
    setLoadingVideos(true);
    const catFilter = activeCategory === 'All' ? undefined : activeCategory;
    const data = await getCuratedVideos(activeProvider, catFilter);
    setVideos(data);
    setLoadingVideos(false);
  };

  const handleToggleSave = (video: CuratedVideo) => {
    setSavedVideoIds((prev) =>
      prev.includes(video.id) ? prev.filter((id) => id !== video.id) : [...prev, video.id]
    );
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPinModal = (mode: 'enter_pin' | 'set_pin') => {
    setPinModalState({ isOpen: true, mode });
  };

  // Group videos into YouTube style shelves & category views
  const familyPicks = videos.filter((v) => v.category === 'Family Picks' || v.category === 'Music');
  const shortsAndClips = videos.filter((v) => v.category === 'Relaxation' || v.tags.includes('Shorts'));
  const educationalVideos = videos.filter((v) => v.category === 'Educational' || v.tags.includes('Science'));
  const vimeoFilms = videos.filter((v) => v.provider === 'vimeo' || v.category === 'Documentary');
  const twitchLiveStreams = videos.filter((v) => v.provider === 'twitch' || v.isLive);
  const savedVideosList = videos.filter((v) => savedVideoIds.includes(v.id));

  return (
    <div className="min-h-screen bg-[#0b0a08] text-cozia-ink flex flex-col selection:bg-cozia-gold selection:text-cozia-bg font-sans">
      {/* YouTube Style Topbar & Search Navigation */}
      <Navbar
        activeProvider={activeProvider}
        onSelectProvider={setActiveProvider}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNominate={() => setIsNominateOpen(true)}
        onOpenPinModal={handleOpenPinModal}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Body with YouTube/MovieBox Left Sidebar + Main Feed Area */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Route Content (YouTube Layout Spacing) */}
        <main
          className={`flex-1 pt-28 pb-24 md:pb-12 w-full px-4 sm:px-6 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`}
        >
          {currentView === 'home' && (
            <div className="space-y-8 animate-fade-in">
              {/* Kids Mode Banner */}
              {isKidsMode && (
                <div className="p-3.5 rounded-2xl bg-cozia-teal/15 border border-cozia-teal/30 text-cozia-teal text-xs flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>Kids Mode Active — Browsing is restricted to family-approved content.</span>
                  </div>
                  <button
                    onClick={() => handleOpenPinModal('enter_pin')}
                    className="px-3 py-1 rounded-lg bg-cozia-teal text-cozia-bg font-semibold hover:opacity-90 transition-all shrink-0"
                  >
                    Exit Kids Mode
                  </button>
                </div>
              )}

              {/* YouTube Style Grid Feed */}
              {loadingVideos ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="h-56 rounded-2xl bg-cozia-surface animate-pulse border border-cozia-line" />
                  ))}
                </div>
              ) : activeCategory !== 'All' || activeProvider !== 'all' ? (
                <VideoGrid
                  title={`${activeProvider !== 'all' ? activeProvider.toUpperCase() : ''} ${activeCategory !== 'All' ? activeCategory : 'Curated Videos'}`}
                  videos={videos}
                  onSelectVideo={(v) => setSelectedVideo(v)}
                  onToggleSave={handleToggleSave}
                  savedVideoIds={savedVideoIds}
                />
              ) : (
                <div className="space-y-10">
                  <VideoGrid
                    title="Recommended For You"
                    videos={videos}
                    onSelectVideo={(v) => setSelectedVideo(v)}
                    onToggleSave={handleToggleSave}
                    savedVideoIds={savedVideoIds}
                  />

                  <VideoShelfRow
                    title="Trending Family Picks"
                    videos={familyPicks.length > 0 ? familyPicks : videos}
                    onSelectVideo={(v) => setSelectedVideo(v)}
                    onToggleSave={handleToggleSave}
                    savedVideoIds={savedVideoIds}
                  />

                  <VideoShelfRow
                    title="Trending Shorts & Clips"
                    videos={shortsAndClips.length > 0 ? shortsAndClips : videos}
                    onSelectVideo={(v) => setSelectedVideo(v)}
                    onToggleSave={handleToggleSave}
                    savedVideoIds={savedVideoIds}
                  />

                  {educationalVideos.length > 0 && (
                    <VideoShelfRow
                      title="Educational & Science Discoveries"
                      videos={educationalVideos}
                      onSelectVideo={(v) => setSelectedVideo(v)}
                      onToggleSave={handleToggleSave}
                      savedVideoIds={savedVideoIds}
                    />
                  )}

                  {vimeoFilms.length > 0 && (
                    <VideoShelfRow
                      title="Vimeo Short Films & Documentaries"
                      videos={vimeoFilms}
                      onSelectVideo={(v) => setSelectedVideo(v)}
                      onToggleSave={handleToggleSave}
                      savedVideoIds={savedVideoIds}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {currentView === 'shorts' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-cozia-line pb-4">
                <h1 className="font-serif text-2xl font-medium tracking-tight">Trending Shorts & Clips</h1>
                <span className="text-xs font-mono text-cozia-ink-faint">Short-form videos</span>
              </div>
              <VideoShelfRow
                title="Top Shorts"
                videos={shortsAndClips.length > 0 ? shortsAndClips : videos}
                onSelectVideo={(v) => setSelectedVideo(v)}
                onToggleSave={handleToggleSave}
                savedVideoIds={savedVideoIds}
              />
            </div>
          )}

          {currentView === 'profile' && (
            <PublicProfile profile={profile} onNavigateEdit={() => handleNavigate('edit-profile')} />
          )}

          {currentView === 'edit-profile' && <EditProfile onBack={() => handleNavigate('profile')} />}

          {currentView === 'moderation' && <ModerationQueue />}

          {currentView === 'live' && (
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
                  onSelectVideo={(v) => setSelectedVideo(v)}
                  onToggleSave={handleToggleSave}
                  savedVideoIds={savedVideoIds}
                />
              )}
            </div>
          )}

          {currentView === 'my-list' && (
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
                    onClick={() => handleNavigate('home')}
                    className="px-5 py-2.5 rounded-xl bg-cozia-gold text-cozia-bg text-xs font-semibold hover:bg-cozia-gold-dim transition-all"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <VideoShelfRow
                  title="Your Saved Videos"
                  videos={savedVideosList}
                  onSelectVideo={(v) => setSelectedVideo(v)}
                  onToggleSave={handleToggleSave}
                  savedVideoIds={savedVideoIds}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottombar */}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />

      {/* Modals & Player Overlays */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <NominateModal isOpen={isNominateOpen} onClose={() => setIsNominateOpen(false)} />
      <ParentalPinModal
        isOpen={pinModalState.isOpen}
        onClose={() => setPinModalState({ ...pinModalState, isOpen: false })}
        mode={pinModalState.mode}
      />
      <PlayerModal
        video={selectedVideo}
        allVideos={videos}
        onClose={() => setSelectedVideo(null)}
        onSelectVideo={(v) => setSelectedVideo(v)}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
