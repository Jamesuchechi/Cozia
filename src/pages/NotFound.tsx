import React from 'react';
import { Link } from 'react-router-dom';
import { Tv2, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 animate-fade-in select-none">
      <div className="w-16 h-16 rounded-3xl bg-cozia-gold/10 text-cozia-gold flex items-center justify-center border border-cozia-gold/20">
        <Tv2 className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-3xl font-medium tracking-tight">404 — Page Not Found</h1>
      <p className="text-xs text-cozia-ink-dim max-w-sm mx-auto">
        The route you are trying to visit does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-cozia-gold text-cozia-bg font-semibold text-xs hover:bg-cozia-gold-dim transition-all flex items-center gap-2 shadow-lg"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home Browse</span>
      </Link>
    </div>
  );
};
