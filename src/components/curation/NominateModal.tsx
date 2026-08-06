import React, { useState } from 'react';
import { X, Link2, Sparkles, AlertCircle, Check, Loader2 } from 'lucide-react';
import { fetchYouTubeMetadata, FetchedYouTubeMetadata } from '../../lib/youtube';
import { fetchVimeoMetadata } from '../../lib/vimeo';
import { fetchDailymotionMetadata } from '../../lib/dailymotion';
import { fetchTwitchMetadata } from '../../lib/twitch';
import { submitNomination } from '../../lib/curation';
import { useAuth } from '../../context/AuthContext';
import { VideoProvider } from '../../types';

interface NominateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NominateModal: React.FC<NominateModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [url, setUrl] = useState<string>('');
  const [provider, setProvider] = useState<VideoProvider>('youtube');
  const [category, setCategory] = useState<string>('Family Picks');
  const [notes, setNotes] = useState<string>('');
  const [fetchedMetadata, setFetchedMetadata] = useState<FetchedYouTubeMetadata | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories = [
    'Family Picks',
    'Educational',
    'Shorts & Clips',
    'Music & Arts',
    'Relaxation',
    'Documentary',
    'Live Streams',
  ];

  const handleFetchMetadata = async () => {
    if (!url.trim()) return;
    setErrorMsg(null);
    setFetching(true);

    try {
      if (url.includes('vimeo.com')) {
        setProvider('vimeo');
        const vimeoMeta = await fetchVimeoMetadata(url);
        setFetchedMetadata({
          videoId: vimeoMeta.videoId,
          title: vimeoMeta.title,
          description: vimeoMeta.description,
          thumbnailUrl: vimeoMeta.thumbnailUrl,
          authorName: vimeoMeta.authorName,
          duration: vimeoMeta.duration || '3:30',
        });
      } else if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
        setProvider('dailymotion');
        const dmMeta = await fetchDailymotionMetadata(url);
        setFetchedMetadata({
          videoId: dmMeta.videoId,
          title: dmMeta.title,
          description: dmMeta.description,
          thumbnailUrl: dmMeta.thumbnailUrl,
          authorName: dmMeta.authorName,
          duration: dmMeta.duration || '4:00',
        });
      } else if (url.includes('twitch.tv') || url.includes('clips.twitch.tv')) {
        setProvider('twitch');
        const twMeta = await fetchTwitchMetadata(url);
        setFetchedMetadata({
          videoId: twMeta.targetId,
          title: twMeta.title,
          description: twMeta.description,
          thumbnailUrl: twMeta.thumbnailUrl,
          authorName: twMeta.authorName,
          duration: twMeta.duration,
        });
      } else {
        setProvider('youtube');
        const meta = await fetchYouTubeMetadata(url);
        setFetchedMetadata(meta);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch video metadata.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await submitNomination(
        profile?.id || 'demo-user-123',
        url,
        provider,
        category,
        notes
      );

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setUrl('');
          setFetchedMetadata(null);
          setNotes('');
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit nomination.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cozia-bg/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-cozia-surface border border-cozia-line rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface-2 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cozia-gold/10 text-cozia-gold mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-medium tracking-tight">Nominate a Video for Curation</h3>
          <p className="text-xs text-cozia-ink-dim mt-1">
            Suggest a YouTube, Vimeo, Dailymotion, or Twitch video for the family-safe catalog.
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-medium text-emerald-400">Nomination Submitted!</h4>
            <p className="text-xs text-cozia-ink-dim max-w-xs mx-auto">
              Your video nomination has been added to the moderation queue for approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* URL Input with Fetch Button */}
            <div>
              <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Video URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3.5 top-3 w-4 h-4 text-cozia-ink-faint" />
                  <input
                    type="url"
                    required
                    placeholder="https://youtube.com/watch?v=... or vimeo.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchMetadata}
                  disabled={fetching || !url.trim()}
                  className="px-4 py-2.5 rounded-xl bg-cozia-surface-2 border border-cozia-line text-cozia-gold text-xs font-semibold hover:border-cozia-gold transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Preview'}
                </button>
              </div>
            </div>

            {/* Fetched Preview Card */}
            {fetchedMetadata && (
              <div className="p-3 rounded-xl bg-cozia-bg border border-cozia-line flex items-center gap-3 animate-fade-in">
                <img
                  src={fetchedMetadata.thumbnailUrl}
                  alt={fetchedMetadata.title}
                  className="w-20 h-14 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xs font-medium text-cozia-ink truncate">
                    {fetchedMetadata.title}
                  </p>
                  <p className="text-[10px] text-cozia-ink-dim font-mono">{fetchedMetadata.authorName}</p>
                </div>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Category Suggestion</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Safety Notes */}
            <div>
              <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Safety Notes / Context</label>
              <textarea
                rows={2}
                placeholder="Why is this video great and safe for families?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !url.trim()}
              className="w-full py-3 rounded-xl bg-cozia-gold text-cozia-bg font-semibold text-xs hover:bg-cozia-gold-dim transition-all shadow-lg shadow-cozia-gold/10 disabled:opacity-40"
            >
              {submitting ? 'Submitting Nomination...' : 'Submit to Curation Queue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
