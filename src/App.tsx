import { useState } from 'react';
import { Play, Sparkles, ShieldCheck, Users, Film, Database } from 'lucide-react';

export default function App() {
  const [supabaseConnected] = useState<boolean>(
    Boolean(import.meta.env.VITE_SUPABASE_URL)
  );

  return (
    <div className="min-h-screen bg-cozia-bg text-cozia-ink flex flex-col selection:bg-cozia-gold selection:text-cozia-bg">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-cozia-line backdrop-blur-md sticky top-0 z-50 bg-cozia-bg/80">
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold tracking-tight">
            Cozia<span className="text-cozia-gold">.</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-cozia-ink-dim font-medium">
          <a href="#features" className="hover:text-cozia-ink transition-colors">Features</a>
          <a href="#browse" className="hover:text-cozia-ink transition-colors">Browse</a>
          <span className="px-3 py-1 text-xs rounded-full bg-cozia-surface-2 border border-cozia-line text-cozia-gold font-mono flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            {supabaseConnected ? 'Supabase Configured' : 'Supabase (Set Env)'}
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cozia-surface border border-cozia-line text-cozia-gold text-xs font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>React + Supabase Setup Active</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl font-medium tracking-tight max-w-3xl leading-tight mb-6">
          Family-friendly social <span className="text-cozia-gold italic">plus</span> streaming
        </h1>

        <p className="text-cozia-ink-dim text-lg max-w-2xl font-sans mb-10 leading-relaxed">
          Watch curated YouTube content inside a Netflix-style browsing experience, enriched with a community layer built for families.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="px-6 py-3.5 rounded-xl bg-cozia-gold text-cozia-bg font-semibold hover:bg-cozia-gold-dim transition-all shadow-lg shadow-cozia-gold/10 flex items-center gap-2">
            <Play className="w-4 h-4 fill-current" />
            <span>Browse Content</span>
          </button>
          <a
            href="https://github.com/Jamesuchechi/Cozia"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 rounded-xl bg-cozia-surface border border-cozia-line text-cozia-ink font-medium hover:bg-cozia-surface-2 transition-all"
          >
            GitHub Repository
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
          <div className="p-6 rounded-2xl bg-cozia-surface border border-cozia-line hover:border-cozia-gold/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cozia-gold/10 flex items-center justify-center text-cozia-gold mb-4">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">Netflix-Style Curation</h3>
            <p className="text-cozia-ink-dim text-sm leading-relaxed">
              Curated rows & hero banners over YouTube content — structured, clean, and engaging.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cozia-surface border border-cozia-line hover:border-cozia-gold/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cozia-teal/10 flex items-center justify-center text-cozia-teal mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">Family-Safe by Design</h3>
            <p className="text-cozia-ink-dim text-sm leading-relaxed">
              First-class curation pipeline and safety checks ensuring high quality content only.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cozia-surface border border-cozia-line hover:border-cozia-gold/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cozia-gold/10 flex items-center justify-center text-cozia-gold mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">Community Social Layer</h3>
            <p className="text-cozia-ink-dim text-sm leading-relaxed">
              See what friends and community members are watching, react to posts, and share comments.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cozia-line py-8 px-6 text-center text-xs text-cozia-ink-faint">
        <p>Cozia &copy; 2026 — Built with React, Vite & Supabase.</p>
      </footer>
    </div>
  );
}
