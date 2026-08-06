import React, { useEffect, useState } from 'react';
import { ModerationItem } from '../types';
import { getModerationQueue, curateVideo } from '../lib/curation';
import { getPendingIngestedVideos, getModerationActions, logModerationAction, ModerationActionItem } from '../lib/moderation';
import { fetchYouTubeMetadata } from '../lib/youtube';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Check, X, ExternalLink, Loader2, History, ListFilter } from 'lucide-react';

export const ModerationQueue: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'audit'>('queue');

  const [items, setItems] = useState<ModerationItem[]>([]);
  const [ingestedPending, setIngestedPending] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<ModerationActionItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    const queue = await getModerationQueue();
    const ingested = await getPendingIngestedVideos();
    const actions = await getModerationActions();

    setItems(queue);
    setIngestedPending(ingested);
    setAuditLogs(actions);
    setLoading(false);
  };

  const handleApproveNomination = async (item: ModerationItem) => {
    setProcessingId(item.id);
    setErrorMessage(null);
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

      const res = await curateVideo({
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

      if (!res.success) {
        setErrorMessage(`Curation write failed: ${res.error || 'Unknown error'}`);
        return;
      }

      if (profile?.id) {
        await logModerationAction(profile.id, 'nomination', item.id, 'approved', `Approved ${item.provider} nomination`);
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      const actions = await getModerationActions();
      setAuditLogs(actions);
    } catch (err: any) {
      setErrorMessage(`Approve error: ${err?.message || String(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectNomination = async (item: ModerationItem) => {
    setProcessingId(item.id);
    if (profile?.id) {
      await logModerationAction(profile.id, 'nomination', item.id, 'rejected', 'Rejected nomination');
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setProcessingId(null);
    const actions = await getModerationActions();
    setAuditLogs(actions);
  };

  const handleApproveIngested = async (ingestedVideo: any) => {
    setProcessingId(ingestedVideo.id);
    setErrorMessage(null);
    const res = await curateVideo({
      id: ingestedVideo.id,
      provider: ingestedVideo.provider,
      providerVideoId: ingestedVideo.provider_video_id,
      title: ingestedVideo.title,
      description: ingestedVideo.description,
      thumbnailUrl: ingestedVideo.thumbnail_url,
      duration: ingestedVideo.duration,
      category: ingestedVideo.category,
      tags: ingestedVideo.tags || [],
      safetyStatus: 'approved',
      addedAt: ingestedVideo.added_at,
    });

    if (!res.success) {
      setErrorMessage(`Failed to approve candidate: ${res.error}`);
      setProcessingId(null);
      return;
    }

    if (profile?.id) {
      await logModerationAction(profile.id, 'video', ingestedVideo.id, 'approved', `Approved ingested ${ingestedVideo.provider} video`);
    }

    setIngestedPending((prev) => prev.filter((v) => v.id !== ingestedVideo.id));
    setProcessingId(null);
    const actions = await getModerationActions();
    setAuditLogs(actions);
  };

  const totalPendingCount = items.length + ingestedPending.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-cozia-line pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-medium tracking-tight">Moderation & Safety</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-cozia-gold/20 text-cozia-gold border border-cozia-gold/30">
              {totalPendingCount} Pending Total
            </span>
          </div>
          <p className="text-xs text-cozia-ink-dim mt-1">
            Review community nominations & Phase 7.5 ingested candidate videos before public display.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'queue'
                ? 'bg-cozia-gold text-cozia-bg'
                : 'bg-cozia-surface border border-cozia-line text-cozia-ink-dim hover:text-cozia-ink'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Pending Queue ({totalPendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'audit'
                ? 'bg-cozia-gold text-cozia-bg'
                : 'bg-cozia-surface border border-cozia-line text-cozia-ink-dim hover:text-cozia-ink'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Log ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-cozia-ink-dim gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-mono">Loading moderation data...</span>
        </div>
      ) : activeTab === 'audit' ? (
        /* Audit Log Section */
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-medium text-cozia-ink">Moderation Actions Audit Log</h3>
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-cozia-surface border border-cozia-line text-cozia-ink-dim text-xs">
              No moderation audit log entries recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-cozia-surface border border-cozia-line flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-cozia-surface-2 text-cozia-gold">
                        {log.action}
                      </span>
                      <span className="text-cozia-ink font-medium">Target: {log.targetType} ({log.targetId})</span>
                    </div>
                    {log.notes && <p className="text-cozia-ink-dim text-[11px]">{log.notes}</p>}
                  </div>
                  <span className="text-[10px] font-mono text-cozia-ink-faint">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : totalPendingCount === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-cozia-surface border border-cozia-line space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-medium">Moderation Queue Clear!</h3>
          <p className="text-xs text-cozia-ink-dim max-w-sm mx-auto">
            All submitted nominations and ingested candidates have passed safety review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Community Nominations */}
          {items.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-serif text-base font-medium text-cozia-gold">Community Nominations ({items.length})</h3>
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

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleRejectNomination(item)}
                      disabled={processingId === item.id}
                      className="px-4 py-2.5 rounded-xl bg-cozia-surface-2 border border-cozia-line text-red-400 text-xs font-semibold hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApproveNomination(item)}
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

          {/* Section 2: Ingested Candidates */}
          {ingestedPending.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-serif text-base font-medium text-cozia-teal">Ingested Ingestion Candidates ({ingestedPending.length})</h3>
              {ingestedPending.map((v) => (
                <div
                  key={v.id}
                  className="p-5 rounded-2xl bg-cozia-surface border border-cozia-line hover:border-cozia-teal/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img src={v.thumbnail_url} alt={v.title} className="w-24 h-16 rounded-xl object-cover" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-cozia-surface-2 text-cozia-gold">
                          {v.provider}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cozia-teal/10 text-cozia-teal font-medium">
                          {v.category}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-medium text-cozia-ink">{v.title}</h4>
                      <p className="text-xs text-cozia-ink-dim line-clamp-1">{v.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApproveIngested(v)}
                    disabled={processingId === v.id}
                    className="px-5 py-2.5 rounded-xl bg-cozia-teal text-cozia-bg text-xs font-semibold hover:opacity-90 transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-40 shrink-0 self-end sm:self-center"
                  >
                    {processingId === v.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve Candidate</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
