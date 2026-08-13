import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { AuthModal } from './components/auth/AuthModal';
import { ParentalPinModal } from './components/auth/ParentalPinModal';
import { NominateModal } from './components/curation/NominateModal';
import { Home } from './pages/Home';
import { Shorts } from './pages/Shorts';
import { Live } from './pages/Live';
import { MyList } from './pages/MyList';
import { PublicProfile } from './pages/PublicProfile';
import { EditProfile } from './pages/EditProfile';
import { ModerationQueue } from './pages/ModerationQueue';
import { Feed } from './pages/Feed';
import { WatchParty } from './pages/WatchParty';
import { WatchPage } from './pages/WatchPage';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { NotFound } from './pages/NotFound';
import { CuratedVideo, VideoProvider } from './types';
import { getCuratedVideos } from './lib/curation';

function AppContent() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeProvider, setActiveProvider] = useState<VideoProvider | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const [videos, setVideos] = useState<CuratedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>([]);

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

  const handleSelectVideo = (video: CuratedVideo) => {
    navigate(`/watch?v=${encodeURIComponent(video.id)}`);
  };

  const handleToggleSave = (video: CuratedVideo) => {
    setSavedVideoIds((prev) =>
      prev.includes(video.id) ? prev.filter((id) => id !== video.id) : [...prev, video.id]
    );
  };

  const handleOpenPinModal = (mode: 'enter_pin' | 'set_pin') => {
    setPinModalState({ isOpen: true, mode });
  };

  return (
    <div className="min-h-screen bg-[#0b0a08] text-cozia-ink flex flex-col selection:bg-cozia-gold selection:text-cozia-bg font-sans">
      {/* Navbar & Header */}
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
      />

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        <Sidebar isCollapsed={isSidebarCollapsed} />

        <main
          className={`flex-1 pt-28 pb-24 md:pb-12 w-full px-4 sm:px-6 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  videos={videos}
                  loadingVideos={loadingVideos}
                  activeProvider={activeProvider}
                  activeCategory={activeCategory}
                  savedVideoIds={savedVideoIds}
                  onSelectVideo={handleSelectVideo}
                  onToggleSave={handleToggleSave}
                  onOpenPinModal={handleOpenPinModal}
                />
              }
            />
            <Route
              path="/watch"
              element={
                <WatchPage
                  videos={videos}
                  savedVideoIds={savedVideoIds}
                  onToggleSave={handleToggleSave}
                />
              }
            />
            <Route
              path="/watch/:id"
              element={
                <WatchPage
                  videos={videos}
                  savedVideoIds={savedVideoIds}
                  onToggleSave={handleToggleSave}
                />
              }
            />
            <Route
              path="/shorts"
              element={
                <Shorts
                  videos={videos}
                  savedVideoIds={savedVideoIds}
                  onSelectVideo={handleSelectVideo}
                  onToggleSave={handleToggleSave}
                />
              }
            />
            <Route
              path="/live"
              element={
                <Live
                  videos={videos}
                  savedVideoIds={savedVideoIds}
                  onSelectVideo={handleSelectVideo}
                  onToggleSave={handleToggleSave}
                />
              }
            />
            <Route
              path="/my-list"
              element={
                <MyList
                  videos={videos}
                  savedVideoIds={savedVideoIds}
                  onSelectVideo={handleSelectVideo}
                  onToggleSave={handleToggleSave}
                />
              }
            />
            <Route path="/feed" element={<Feed />} />
            <Route path="/watch-party" element={<WatchParty />} />
            <Route path="/watch-party/:roomId" element={<WatchParty />} />
            <Route path="/profile/me" element={<PublicProfile profile={profile} />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/moderation" element={<ModerationQueue />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Overlays & Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <NominateModal isOpen={isNominateOpen} onClose={() => setIsNominateOpen(false)} />
      <ParentalPinModal
        isOpen={pinModalState.isOpen}
        onClose={() => setPinModalState({ ...pinModalState, isOpen: false })}
        mode={pinModalState.mode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
