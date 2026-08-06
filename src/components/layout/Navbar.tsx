import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, ShieldCheck, User, LogOut, Settings, ChevronDown, Menu, Plus, Mic } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VideoProvider } from '../../types';

interface NavbarProps {
  activeProvider: VideoProvider | 'all';
  onSelectProvider: (provider: VideoProvider | 'all') => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenAuth: () => void;
  onOpenNominate: () => void;
  onOpenPinModal: (mode: 'enter_pin' | 'set_pin') => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenAuth,
  onOpenNominate,
  onOpenPinModal,
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const { profile, isKidsMode, toggleKidsMode, hasParentalPin, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterChips = [
    'All',
    'Family Picks',
    'Trending Shorts',
    'Educational',
    'Twitch Live',
    'Vimeo Films',
    'Music',
    'Storytime',
    'Comedy',
    'Documentary',
  ];

  const handleKidsToggle = async () => {
    if (isKidsMode) {
      if (hasParentalPin) {
        onOpenPinModal('enter_pin');
      } else {
        await toggleKidsMode();
      }
    } else {
      if (!hasParentalPin) {
        onOpenPinModal('set_pin');
      } else {
        await toggleKidsMode();
      }
    }
  };

  const profilePath = profile ? `/profile/${profile.id}` : '/profile/me';

  return (
    <>
      {/* Top Main Navigation Bar (Full Width Topbar) */}
      <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-[#0f0e0c] border-b border-cozia-line select-none flex items-center px-4 justify-between gap-4">
        {/* Left Logo & Hamburger Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
            className="p-2 rounded-xl text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface-2 transition-all"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight hover:opacity-90 transition-opacity"
          >
            <span>Cozia</span>
            <span className="text-cozia-gold">.</span>
          </Link>
        </div>

        {/* Center Wide Search Bar (YouTube Style) */}
        <div className="hidden sm:flex flex-1 max-w-xl mx-4 items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search curated videos, topics, or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-xs rounded-l-full bg-cozia-surface border border-cozia-line text-cozia-ink placeholder-cozia-ink-faint focus:outline-none focus:border-cozia-gold transition-all"
            />
            <button
              aria-label="Search curated videos"
              className="absolute right-0 top-0 bottom-0 px-4 rounded-r-full bg-cozia-surface-2 border-l border-cozia-line text-cozia-ink-dim hover:text-cozia-gold transition-colors flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <button
            aria-label="Search with voice"
            className="p-2.5 rounded-full bg-cozia-surface border border-cozia-line text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface-2 transition-all"
            title="Search with Voice"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Nominate Video Button */}
          <button
            onClick={onOpenNominate}
            aria-label="Nominate a new family-safe video"
            className="px-3.5 py-1.5 rounded-xl bg-cozia-gold/15 border border-cozia-gold/30 text-cozia-gold text-xs font-semibold hover:bg-cozia-gold hover:text-cozia-bg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Nominate</span>
          </button>

          {/* Kids Mode Toggle */}
          <button
            onClick={handleKidsToggle}
            aria-label={isKidsMode ? "Disable Kids Mode" : "Enable Kids Mode"}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isKidsMode
                ? 'bg-cozia-teal/20 border-cozia-teal text-cozia-teal shadow-md shadow-cozia-teal/10'
                : 'bg-cozia-surface border-cozia-line text-cozia-ink-dim hover:text-cozia-ink'
            }`}
            title={isKidsMode ? 'Kids Mode Active (PIN protected)' : 'Enable Kids Mode'}
          >
            {isKidsMode ? <ShieldCheck className="w-4 h-4 text-cozia-teal" /> : <Shield className="w-4 h-4" />}
            <span className="hidden lg:inline">{isKidsMode ? 'Kids Mode ON' : 'Kids Mode'}</span>
          </button>

          {/* User Profile Dropdown */}
          {profile ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Open profile options menu"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-cozia-surface border border-transparent hover:border-cozia-line transition-all"
              >
                <img
                  src={
                    profile.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                  }
                  alt={profile.displayName}
                  loading="lazy"
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-cozia-gold/30"
                />
                <ChevronDown className="w-3.5 h-3.5 text-cozia-ink-dim hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-cozia-surface border border-cozia-line rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-xs">
                  <div className="px-4 py-2.5 border-b border-cozia-line">
                    <p className="font-semibold text-cozia-ink truncate">{profile.displayName}</p>
                    <p className="text-cozia-ink-faint font-mono">@{profile.username}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate(profilePath);
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-cozia-surface-2 flex items-center gap-2 text-cozia-ink transition-colors"
                  >
                    <User className="w-4 h-4 text-cozia-gold" />
                    <span>View Public Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile/edit');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-cozia-surface-2 flex items-center gap-2 text-cozia-ink transition-colors"
                  >
                    <Settings className="w-4 h-4 text-cozia-ink-dim" />
                    <span>Profile Settings</span>
                  </button>

                  <div className="border-t border-cozia-line my-1" />

                  <button
                    onClick={() => {
                      signOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-cozia-surface-2 flex items-center gap-2 text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-xl bg-cozia-gold text-cozia-bg font-semibold text-xs hover:bg-cozia-gold-dim transition-all shadow-md shadow-cozia-gold/10"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Category Filter Chips Bar (YouTube Style - Fixed right of sidebar at top-14) */}
      <div
        className={`fixed top-14 right-0 z-20 h-12 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-cozia-line/60 bg-[#0c0b09] transition-all duration-300 ${
          isSidebarCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-60'
        }`}
      >
        {filterChips.map((chip) => {
          const isActive = activeCategory === chip;
          return (
            <button
              key={chip}
              onClick={() => onSelectCategory(chip)}
              className={`px-3.5 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                isActive
                  ? 'bg-cozia-ink text-cozia-bg font-semibold shadow-sm'
                  : 'bg-cozia-surface border border-cozia-line text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface-2'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </>
  );
};
