import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Radio, Users, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { isKidsMode, profile } = useAuth();
  const location = useLocation();

  const profilePath = profile ? `/profile/${profile.id}` : '/profile/me';

  const items = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/live', label: 'Live', icon: Radio },
    { path: '/my-list', label: 'My List', icon: Bookmark },
    { path: '/feed', label: 'Feed', icon: Users, hideInKids: true },
    { path: profilePath, label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cozia-bg/95 backdrop-blur-md border-t border-cozia-line px-2 py-2 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        if (item.hideInKids && isKidsMode) return null;
        const Icon = item.icon;
        const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-cozia-gold font-semibold' : 'text-cozia-ink-dim hover:text-cozia-ink'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-cozia-gold scale-110' : 'text-cozia-ink-dim'}`} />
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
