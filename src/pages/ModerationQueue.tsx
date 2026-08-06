import React, { useEffect, useState } from 'react';
import { ModerationItem } from '../types';
import { getModerationQueue, curateVideo } from '../lib/curation';
import { fetchYouTubeMetadata } from '../lib/youtube';
import { ShieldCheck, Check, X, ExternalLink, Loader2 } from 'lucide-react';

export const ModerationQueue: React.FC = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    const data = await getModerationQueue();
    setItems(data);
    setLoading(false);
  };

  const handleApprove = async (item: ModerationItem) => {
    setProcessingId(item.id);
    try {
      let title = `Curated ${item.provider} Video`;
      let description = item.notes || 'Curated family-friendly content.';
      let thumbnailUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
      let duration = '4:00';
      let providerVideoId = 'sample-id';

      if (item.provider === 'youtube') {
        const meta = await fetchYouTubeMetadata(item.videoUrl);
        title = meta.title;
        description = meta.description;
        thumbnailUrl = meta.thumbnailUrl;
        duration = meta.duration || '3:30';
        providerVideoId = meta.videoId;
      } else {
        providerVideoId = `v-${Date.now()}`;
      }

      await curateVideo({
        id: `curated-${Date.now()}`,
        provider: item.provider,
        providerVideoId,
        title,
        description,
        thumbnailUrl,
        duration,
        category: item.categorySuggestion || 'Family Picks',
        tags: ['Curated', item.categorySuggestion || 'General'],
        safetyStatus: 'approved',
        addedAt: new Date().toISOString(),
      });

      // Remove from pending list
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (itemId: string) => {
    setProcessingId(itemId);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setProcessingId(null);
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cozia-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-medium tracking-tight">Moderation Queue</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-cozia-gold/20 text-cozia-gold border border-cozia-gold/30">
              {items.length} Pending
            </span>
          </div>
          <p className="text-xs text-cozia-ink-dim mt-1">
            Review community-nominated videos before publishing to public browse rows.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-cozia-teal font-semibold px-3 py-1.5 rounded-xl bg-cozia-teal/10 border border-cozia-teal/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Curator Access</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-cozia-ink-dim gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-mono">Loading moderation items...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-cozia-surface border border-cozia-line space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-medium">Queue Clear!</h3>
          <p className="text-xs text-cozia-ink-dim max-w-sm mx-auto">
            All submitted video nominations have been reviewed and approved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-cozia-surface border border-cozia-line hover:border-cozia-gold/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-cozia-surface-2 text-cozia-gold">
                    {item.provider}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cozia-teal/10 text-cozia-teal font-medium">
                    {item.categorySuggestion || 'Family Picks'}
                  </span>
                  {item.submittingUser && (
                    <span className="text-cozia-ink-faint font-mono text-[11px]">
                      by @{item.submittingUser.username}
                    </span>
                  )}
                </div>

                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-serif text-base font-medium text-cozia-ink hover:text-cozia-gold transition-colors flex items-center gap-1.5 group"
                >
                  <span className="truncate max-w-lg">{item.videoUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                </a>

                {item.notes && (
                  <p className="text-xs text-cozia-ink-dim bg-cozia-bg/60 p-2.5 rounded-xl border border-cozia-line/60">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleReject(item.id)}
                  disabled={processingId === item.id}
                  className="px-4 py-2.5 rounded-xl bg-cozia-surface-2 border border-cozia-line text-red-400 text-xs font-semibold hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleApprove(item)}
                  disabled={processingId === item.id}
                  className="px-5 py-2.5 rounded-xl bg-cozia-gold text-cozia-bg text-xs font-semibold hover:bg-cozia-gold-dim transition-all shadow-lg shadow-cozia-gold/10 flex items-center gap-1.5 disabled:opacity-40"
                >
                  {processingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Approve & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
