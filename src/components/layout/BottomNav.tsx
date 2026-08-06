import React from 'react';
import { Home, Radio, Users, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { isKidsMode } = useAuth();

  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'live', label: 'Live', icon: Radio },
    { id: 'my-list', label: 'My List', icon: Bookmark },
    { id: 'feed', label: 'Feed', icon: Users, hideInKids: true },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cozia-bg/95 backdrop-blur-md border-t border-cozia-line px-2 py-2 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        if (item.hideInKids && isKidsMode) return null;
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-cozia-gold font-semibold' : 'text-cozia-ink-dim hover:text-cozia-ink'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-cozia-gold scale-110' : 'text-cozia-ink-dim'}`} />
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
