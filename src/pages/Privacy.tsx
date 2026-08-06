import React from 'react';
import { Lock } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-cozia-ink animate-fade-in select-none">
      <div className="border-b border-cozia-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-cozia-ink-dim mt-1">Effective Date: August 2026</p>
        </div>
        <Lock className="w-6 h-6 text-cozia-teal" />
      </div>

      <div className="space-y-4 text-xs text-cozia-ink-dim leading-relaxed bg-cozia-surface p-6 rounded-2xl border border-cozia-line">
        <h2 className="text-sm font-semibold text-cozia-teal">1. Family Privacy & Data Protection</h2>
        <p>
          Cozia prioritizes child and family privacy. We do not sell personal data or track children's browsing activity for targeted advertising.
        </p>

        <h2 className="text-sm font-semibold text-cozia-teal">2. Parental Controls & PIN Lock</h2>
        <p>
          Kids Mode restricts browsing strictly to family-approved content and is protected by a hashed 4-digit Parental PIN stored securely in Supabase.
        </p>
      </div>
    </div>
  );
};
