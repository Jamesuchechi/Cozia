import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams, Link } from 'react-router-dom';
import { CuratedVideo } from '../types';
import { searchAllSources } from '../lib/video/aggregator';
import { videoToCurated, getCuratedVideos } from '../lib/curation';
import { extractDominantHue, applyAmbientHue } from '../lib/video/accent';
import { useUserStore } from '../stores/userStore';
import { toNormalizedVideo } from '../lib/video/normalizer';
import { NativeVideoEngine } from '../components/player/NativeVideoEngine';
import { IFrameVideoEngine } from '../components/player/IFrameVideoEngine';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Check,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface WatchPageProps {
  videos: CuratedVideo[];
  savedVideoIds?: string[];
  onToggleSave?: (video: CuratedVideo) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  videos = [],
  savedVideoIds = [],
  onToggleSave,
}) => {
  const [searchParams] = useSearchParams();
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const currentId = routeId || searchParams.get('v');

  const [activeVideo, setActiveVideo] = useState<CuratedVideo | null>(null);
  const [relatedList, setRelatedList] = useState<CuratedVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isDisliked, setIsDisliked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(1240);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [engineAFailed, setEngineAFailed] = useState<boolean>(false);

  // Comments state
  const [commentInput, setCommentInput] = useState<string>('');
  const [comments, setComments] = useState<
    Array<{ id: string; author: string; avatar: string; text: string; time: string; likes: number }>
  >([
    {
      id: 'c1',
      author: 'Alex Turner',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=alex',
      text: 'The streaming quality and color profile on this video is outstanding! Absolutely loved it.',
      time: '2 hours ago',
      likes: 14,
    },
    {
      id: 'c2',
      author: 'TechExplorer',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=techexplorer',
      text: 'Super clean video architecture and very engaging presentation.',
      time: '5 hours ago',
      likes: 8,
    },
    {
      id: 'c3',
      author: 'Maria Garcia',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=maria',
      text: 'Great family-friendly content. Saved to my playlist!',
      time: '1 day ago',
      likes: 23,
    },
  ]);

  const recordWatch = useUserStore((state) => state.recordWatch);

  useEffect(() => {
    window.scrollTo(0, 0);
    setEngineAFailed(false);
    loadWatchData();
  }, [currentId]);

  const loadWatchData = async () => {
    setLoading(true);

    let match: CuratedVideo | undefined;

    if (currentId) {
      match = videos.find((v) => v.id === currentId || v.providerVideoId === currentId);
    }

    if (!match && currentId) {
      // Direct provider API query fallback if opened directly from external URL
      try {
        const directResults = await searchAllSources({ query: currentId, limit: 5 });
        if (directResults.length > 0) {
          match = videoToCurated(directResults[0]);
        }
      } catch (err) {
        console.warn('Direct video lookup warning:', err);
      }
    }

    // Fallback to first video in catalog if still no match
    if (!match && videos.length > 0) {
      match = videos[0];
    }

    if (match) {
      setActiveVideo(match);
      const norm = toNormalizedVideo(match);
      recordWatch(norm);

      if (match.thumbnailUrl) {
        extractDominantHue(match.thumbnailUrl).then((hsl) => {
          applyAmbientHue(hsl);
        });
      }
    }

    // Load related sidebar videos
    if (videos.length > 1) {
      const filtered = videos.filter((v) => v.id !== match?.id);
      setRelatedList(filtered);
    } else {
      const fetched = await getCuratedVideos();
      setRelatedList(fetched.filter((v) => v.id !== match?.id));
    }

    setLoading(false);
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      if (isDisliked) setIsDisliked(false);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setComments([
      {
        id: `c-${Date.now()}`,
        author: 'You',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=you',
        text: commentInput.trim(),
        time: 'Just now',
        likes: 0,
      },
      ...comments,
    ]);
    setCommentInput('');
  };

  const isSaved = activeVideo ? savedVideoIds.includes(activeVideo.id) : false;
  const normVideo = activeVideo ? toNormalizedVideo(activeVideo) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 animate-fade-in relative selection:bg-cozia-gold selection:text-cozia-bg">
      {/* Ambient Glow Container */}
      <div className="absolute -top-10 left-1/4 w-3/4 h-96 ambient-glow-container rounded-full opacity-30 pointer-events-none blur-3xl" />

      {loading || !activeVideo || !normVideo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video w-full rounded-2xl bg-cozia-surface animate-pulse border border-cozia-line" />
            <div className="h-8 w-3/4 rounded-xl bg-cozia-surface animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-cozia-surface animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 rounded-2xl bg-cozia-surface animate-pulse border border-cozia-line" />
            ))}
          </div>
        </div>
      ) : (
        /* YouTube Style 2-Column Responsive Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start relative z-10">
          {/* Main Content Area (Left Column - 70%) */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Main Responsive Player Engine */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-cozia-line shadow-2xl">
              {normVideo.directStreamUrl && !engineAFailed ? (
                <NativeVideoEngine
                  src={normVideo.directStreamUrl}
                  poster={normVideo.thumbnailUrl}
                  onErrorFallback={() => setEngineAFailed(true)}
                />
              ) : (
                <IFrameVideoEngine video={normVideo} />
              )}
            </div>

            {/* 2. Video Title Header */}
            <h1 className="font-sans text-lg sm:text-xl md:text-2xl font-bold text-cozia-ink tracking-tight leading-snug">
              {activeVideo.title}
            </h1>

            {/* 3. Creator Channel Row & Action Buttons (YouTube Style) */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-cozia-line/60">
              {/* Creator Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-800 border border-white/10 overflow-hidden shrink-0 shadow-md">
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${activeVideo.providerVideoId}`}
                    alt="Channel Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm sm:text-base text-white">
                    <span>{activeVideo.category} Creator</span>
                    <CheckCircle2 className="w-4 h-4 text-cozia-teal shrink-0" />
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">18.4K subscribers</p>
                </div>

                <button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`ml-2 px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all shadow-md ${
                    isSubscribed
                      ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-white/10'
                      : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              {/* Action Toolbar Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Like / Dislike Combined Pill */}
                <div className="flex items-center bg-cozia-surface border border-cozia-line rounded-full overflow-hidden text-xs font-semibold shadow-sm">
                  <button
                    onClick={handleLike}
                    className={`px-3.5 py-2 flex items-center gap-1.5 transition-colors border-r border-cozia-line ${
                      isLiked ? 'text-cozia-gold bg-cozia-gold/15' : 'text-cozia-ink hover:bg-cozia-surface-2'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likeCount.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={handleDislike}
                    className={`px-3 py-2 transition-colors ${
                      isDisliked ? 'text-red-400 bg-red-500/15' : 'text-cozia-ink hover:bg-cozia-surface-2'
                    }`}
                    title="I dislike this"
                  >
                    <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Watch Party Button */}
                <Link
                  to={`/watch-party?v=${encodeURIComponent(activeVideo.id)}`}
                  className="px-3.5 py-2 rounded-full bg-cozia-teal/20 text-cozia-teal border border-cozia-teal/40 hover:bg-cozia-teal/30 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  title="Start frame-accurate synced Watch Party"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Watch Party</span>
                </Link>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="px-3.5 py-2 rounded-full bg-cozia-surface border border-cozia-line hover:bg-cozia-surface-2 text-cozia-ink transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm relative"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>

                {/* Save Bookmark Pill */}
                <button
                  onClick={() => onToggleSave && onToggleSave(activeVideo)}
                  className={`px-3.5 py-2 rounded-full border transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm ${
                    isSaved
                      ? 'bg-cozia-gold text-cozia-bg border-cozia-gold'
                      : 'bg-cozia-surface border-cozia-line hover:bg-cozia-surface-2 text-cozia-ink'
                  }`}
                >
                  {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* 4. Expandable YouTube Description Box */}
            <div className="bg-cozia-surface/80 hover:bg-cozia-surface border border-cozia-line rounded-2xl p-4 transition-all space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-3 font-semibold text-cozia-ink text-xs">
                <span>{activeVideo.duration || '3:45'}</span>
                <span>•</span>
                <span className="uppercase text-cozia-gold font-mono">{activeVideo.provider}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-cozia-teal/20 text-cozia-teal border border-cozia-teal/30 text-[10px] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Family Approved
                </span>
              </div>

              <div className={`text-cozia-ink-dim leading-relaxed whitespace-pre-line ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                {activeVideo.description || 'Curated high-quality video stream aggregated on Cozia.'}
              </div>

              {activeVideo.tags && activeVideo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {activeVideo.tags.map((tag) => (
                    <span key={tag} className="text-cozia-gold hover:underline cursor-pointer text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 font-bold text-white text-xs hover:underline flex items-center gap-1"
              >
                <span>{showFullDescription ? 'Show less' : 'Show more'}</span>
                {showFullDescription ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* 5. Comments Section */}
            <div className="pt-4 space-y-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cozia-gold" />
                <h3 className="font-sans text-base sm:text-lg font-bold text-cozia-ink">
                  {comments.length} Comments
                </h3>
              </div>

              {/* Comment Input Composer */}
              <form onSubmit={handleAddComment} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-cozia-gold text-cozia-bg font-bold flex items-center justify-center text-xs shrink-0">
                  YOU
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Add a family-safe comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
                  />
                  {commentInput.trim() && (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setCommentInput('')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-cozia-ink-dim hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-cozia-gold text-cozia-bg font-semibold text-xs hover:bg-cozia-gold-dim shadow"
                      >
                        Comment
                      </button>
                    </div>
                  )}
                </div>
              </form>

              {/* Comment List */}
              <div className="space-y-4 pt-2">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 group">
                    <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full bg-neutral-800 shrink-0" />
                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{c.author}</span>
                        <span className="text-[10px] text-cozia-ink-faint font-mono">{c.time}</span>
                      </div>
                      <p className="text-cozia-ink-dim leading-normal">{c.text}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-cozia-ink-dim">
                        <button className="hover:text-white flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{c.likes > 0 ? c.likes : ''}</span>
                        </button>
                        <button className="hover:text-white font-medium">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Area (Related Videos - 30%) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-sm sm:text-base font-bold text-cozia-ink flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cozia-gold" />
                <span>Up Next & Related</span>
              </h3>
            </div>

            {/* Sidebar Compact Video Cards */}
            <div className="space-y-3">
              {relatedList.slice(0, 10).map((relVid) => (
                <div
                  key={relVid.id}
                  onClick={() => navigate(`/watch?v=${encodeURIComponent(relVid.id)}`)}
                  className="group flex items-start gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-cozia-surface/80 transition-all select-none border border-transparent hover:border-cozia-line/60"
                >
                  {/* Compact Thumbnail (16:9) */}
                  <div className="relative w-36 sm:w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0 shadow">
                    <img
                      src={relVid.thumbnailUrl}
                      alt={relVid.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-black/80 text-white backdrop-blur-md">
                      {relVid.duration || '3:45'}
                    </div>
                  </div>

                  {/* Sidebar Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-sans text-xs font-semibold text-cozia-ink group-hover:text-cozia-gold transition-colors line-clamp-2 leading-snug">
                      {relVid.title}
                    </h4>
                    <p className="text-[11px] text-cozia-ink-dim truncate flex items-center gap-1">
                      <span>{relVid.category}</span>
                      <CheckCircle2 className="w-3 h-3 text-cozia-teal shrink-0" />
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-cozia-ink-faint font-mono uppercase">
                      <span className="px-1.5 py-0.5 rounded bg-cozia-surface-2 text-cozia-ink">
                        {relVid.provider}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
