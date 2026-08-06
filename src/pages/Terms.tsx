import React from 'react';
import { FileText } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-cozia-ink animate-fade-in select-none">
      <div className="border-b border-cozia-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">Terms of Service</h1>
          <p className="text-xs text-cozia-ink-dim mt-1">Effective Date: August 2026</p>
        </div>
        <FileText className="w-6 h-6 text-cozia-gold" />
      </div>

      <div className="space-y-4 text-xs text-cozia-ink-dim leading-relaxed bg-cozia-surface p-6 rounded-2xl border border-cozia-line">
        <h2 className="text-sm font-semibold text-cozia-gold">1. Overview & Service Contract</h2>
        <p>
          Cozia provides a curated, family-safe video discovery and social watch platform. By accessing or using Cozia, you agree to comply with these Terms of Service.
        </p>

        <h2 className="text-sm font-semibold text-cozia-gold">2. Third-Party Platform Content</h2>
        <p>
          Cozia ingests, normalizes, and embeds video content from third-party platforms including YouTube, Vimeo, Dailymotion, and Twitch. All third-party video content remains the property of their respective creators and copyright owners. Playback is executed via official embedded player SDKs and oEmbed protocols.
        </p>

        <h2 className="text-sm font-semibold text-cozia-gold">3. Content Moderation & Family Safety Guarantee</h2>
        <p>
          All ingested and community-nominated content must pass through Cozia's strict safety status moderation gate (`safety_status = 'approved'`) before appearing on public surfaces.
        </p>
      </div>
    </div>
  );
};
