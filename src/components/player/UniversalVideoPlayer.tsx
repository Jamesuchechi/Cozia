import React, { useState } from 'react';
import { CuratedVideo } from '../../types';
import { VimeoPlayer } from './VimeoPlayer';
import { DailymotionPlayer } from './DailymotionPlayer';
import { TwitchPlayer } from './TwitchPlayer';
import { VideoCard } from '../video/VideoCard';
import { ThumbsUp, Heart, Star, Smile, Share2, ShieldCheck, MessageSquare, CheckCircle2 } from 'lucide-react';

interface UniversalVideoPlayerProps {
  video: CuratedVideo;
  allVideos?: CuratedVideo[];
  onSelectVideo?: (video: CuratedVideo) => void;
  onToggleSave?: (video: CuratedVideo) => void;
  isSaved?: boolean;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  video,
  allVideos = [],
  onSelectVideo,
  onToggleSave,
}) => {
  const [reactions, setReactions] = useState<{
    likes: number;
    hearts: number;
    stars: number;
    laughs: number;
  }>({
    likes: 54,
    hearts: 112,
    stars: 88,
    laughs: 29,
  });

  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<
    { id: string; author: string; avatar: string; text: string; time: string }[]
  >([
    {
      id: 'c1',
      author: 'FamilyViewer99',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=user1',
      text: 'Amazing video! Super clean and family-safe quality content.',
      time: '2 hours ago',
    },
    {
      id: 'c2',
      author: 'Sarah Jenkins',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=user2',
      text: 'Watched this with my kids, they loved every minute of it!',
      time: '5 hours ago',
    },
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments([
      {
        id: `c-${Date.now()}`,
        author: 'You',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=currentUser',
        text: commentText.trim(),
        time: 'Just now',
      },
      ...comments,
    ]);
    setCommentText('');
  };

  const relatedVideos = allVideos
    .filter((v) => v.id !== video.id)
    .slice(0, 4);

  const renderPlayerEngine = () => {
    switch (video.provider) {
      case 'youtube':
        return (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-cozia-surface-2 shadow-2xl border border-cozia-line">
            <iframe
              src={`https://www.youtube.com/embed/${video.providerVideoId}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          </div>
        );

      case 'vimeo':
        return <VimeoPlayer videoId={video.providerVideoId} autoPlay={true} />;

      case 'dailymotion':
        return <DailymotionPlayer videoId={video.providerVideoId} autoPlay={true} />;

      case 'twitch':
        return <TwitchPlayer videoIdOrChannel={video.providerVideoId} autoPlay={true} />;

      default:
        return (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-cozia-surface-2 shadow-2xl border border-cozia-line flex items-center justify-center text-cozia-ink">
            <p>Playing video: {video.title}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* 1. Main Video Player Engine */}
      {renderPlayerEngine()}

      {/* 2. Video Title & Custom Chrome Header */}
      <div className="space-y-4">
        <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-cozia-ink leading-snug">
          {video.title}
        </h1>

        {/* Creator Info + Action & Reaction Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cozia-line">
          {/* Creator Profile Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 overflow-hidden shrink-0">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${video.providerVideoId}`}
                alt="Channel Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-semibold text-white">
                <span>Cozia {video.category}</span>
                <CheckCircle2 className="w-4 h-4 text-cozia-teal shrink-0" />
              </div>
              <p className="text-xs text-neutral-400">Curated Creator</p>
            </div>
          </div>

          {/* Provider & Safety Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cozia-gold text-cozia-bg uppercase">
              {video.provider}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cozia-teal/20 text-cozia-teal border border-cozia-teal/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Family Safe</span>
            </span>
          </div>

          {/* Reaction Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReactions({ ...reactions, likes: reactions.likes + 1 })}
              className="px-3 py-1.5 rounded-xl bg-cozia-surface-2 hover:bg-cozia-gold/20 text-cozia-ink hover:text-cozia-gold border border-cozia-line transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{reactions.likes}</span>
            </button>

            <button
              onClick={() => setReactions({ ...reactions, hearts: reactions.hearts + 1 })}
              className="px-3 py-1.5 rounded-xl bg-cozia-surface-2 hover:bg-red-500/20 text-cozia-ink hover:text-red-400 border border-cozia-line transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>{reactions.hearts}</span>
            </button>

            <button
              onClick={() => setReactions({ ...reactions, stars: reactions.stars + 1 })}
              className="px-3 py-1.5 rounded-xl bg-cozia-surface-2 hover:bg-amber-500/20 text-cozia-ink hover:text-amber-400 border border-cozia-line transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>{reactions.stars}</span>
            </button>

            <button
              onClick={() => setReactions({ ...reactions, laughs: reactions.laughs + 1 })}
              className="px-3 py-1.5 rounded-xl bg-cozia-surface-2 hover:bg-emerald-500/20 text-cozia-ink hover:text-emerald-400 border border-cozia-line transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <Smile className="w-3.5 h-3.5 text-emerald-400" />
              <span>{reactions.laughs}</span>
            </button>

            <button className="px-3 py-1.5 rounded-xl bg-cozia-surface-2 text-cozia-ink-dim hover:text-cozia-ink border border-cozia-line transition-all flex items-center gap-1.5 text-xs font-medium">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Video Description Box */}
        <p className="text-xs sm:text-sm text-cozia-ink-dim leading-relaxed bg-cozia-surface p-4 rounded-2xl border border-cozia-line">
          {video.description || 'Curated family-safe entertainment on Cozia.'}
        </p>
      </div>

      {/* 3. Community Comments Section */}
      <div className="space-y-4 pt-4 border-t border-cozia-line">
        <h3 className="font-sans text-lg font-semibold flex items-center gap-2 text-cozia-ink">
          <MessageSquare className="w-5 h-5 text-cozia-gold" />
          <span>Comments ({comments.length})</span>
        </h3>

        {/* Add Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            placeholder="Share a family-safe comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="px-5 py-2.5 rounded-xl bg-cozia-gold text-cozia-bg font-semibold text-xs hover:bg-cozia-gold-dim transition-all disabled:opacity-40"
          >
            Post Comment
          </button>
        </form>

        {/* Comments Feed List */}
        <div className="space-y-3">
          {comments.map((comm) => (
            <div key={comm.id} className="p-3.5 rounded-xl bg-cozia-surface/60 border border-cozia-line/50 flex items-start gap-3">
              <img src={comm.avatar} alt={comm.author} className="w-8 h-8 rounded-full bg-neutral-800" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cozia-ink">{comm.author}</span>
                  <span className="text-[10px] text-cozia-ink-faint font-mono">{comm.time}</span>
                </div>
                <p className="text-xs text-cozia-ink-dim leading-relaxed">{comm.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Cross-Platform Related Videos Section */}
      {relatedVideos.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-cozia-line">
          <h3 className="font-sans text-lg font-semibold text-cozia-ink">Related Videos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedVideos.map((relVid) => (
              <VideoCard
                key={relVid.id}
                video={relVid}
                onSelectVideo={onSelectVideo}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
