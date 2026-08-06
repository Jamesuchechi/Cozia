import React from 'react';
import {
  Home,
  Flame,
  Radio,
  Tv2,
  Bookmark,
  Users,
  ShieldCheck,
  User,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isCollapsed }) => {
  const { isKidsMode, profile } = useAuth();

  const mainNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shorts', label: 'Shorts', icon: Flame },
    { id: 'live', label: 'Live Streams', icon: Radio, badge: 'Twitch' },
    { id: 'watch-party', label: 'Watch Together', icon: Tv2 },
  ];

  const libraryNav = [
    { id: 'my-list', label: 'My List', icon: Bookmark },
    { id: 'feed', label: 'Community Feed', icon: Users, hideInKids: true },
    { id: 'profile', label: 'Your Profile', icon: User },
    { id: 'edit-profile', label: 'Settings', icon: Settings },
  ];

  const adminNav = [
    { id: 'moderation', label: 'Moderation Queue', icon: ShieldCheck, roleRequired: 'admin' },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-cozia-line bg-[#0f0e0c] fixed left-0 top-14 bottom-0 transition-all duration-300 ${
        isCollapsed ? 'w-16 px-2' : 'w-60 px-3'
      } py-4 z-30 select-none overflow-y-auto scrollbar-none`}
    >
      {/* Main Section */}
      <div className="space-y-1 mb-6">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cozia-surface-2 text-cozia-gold font-semibold border border-cozia-gold/20'
                  : 'text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cozia-gold' : 'text-cozia-ink-dim'}`} />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-purple-600/20 text-purple-400 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Library Section */}
      {!isCollapsed && (
        <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-cozia-ink-faint">
          Library
        </div>
      )}
      <div className="space-y-1 mb-6">
        {libraryNav.map((item) => {
          if (item.hideInKids && isKidsMode) return null;
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cozia-surface-2 text-cozia-gold font-semibold border border-cozia-gold/20'
                  : 'text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cozia-gold' : 'text-cozia-ink-dim'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Admin / Curator Section */}
      {profile?.role === 'admin' && (
        <>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-cozia-gold">
              Curation Admin
            </div>
          )}
          <div className="space-y-1 mb-6">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cozia-gold/15 text-cozia-gold font-semibold border border-cozia-gold/30'
                      : 'text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface/60'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 shrink-0 text-cozia-gold" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Sidebar Footer Badge */}
      {!isCollapsed && (
        <div className="mt-auto p-3.5 rounded-2xl bg-cozia-surface border border-cozia-line text-left">
          <div className="flex items-center gap-1.5 text-cozia-gold text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Family Curation</span>
          </div>
          <p className="text-[10px] text-cozia-ink-faint leading-relaxed">
            YouTube, Vimeo, Dailymotion & Twitch streams.
          </p>
        </div>
      )}
    </aside>
  );
};
