import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PostItem, CommentItem, createPost, getPosts, addComment, getComments, addReaction, removeReaction } from '../lib/social';
import { CuratedVideo } from '../types';
import { getCuratedVideos } from '../lib/curation';
import { MessageSquare, Heart, Send, Sparkles, Loader2 } from 'lucide-react';

export const Feed: React.FC = () => {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Composer state
  const [postContent, setPostContent] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [availableVideos, setAvailableVideos] = useState<CuratedVideo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active comments & reactions state per post
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  const [replyContentMap, setReplyContentMap] = useState<Record<string, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [reactionsMap, setReactionsMap] = useState<Record<string, { count: number; userReacted: boolean }>>({});

  useEffect(() => {
    loadFeed();
    loadVideosForComposer();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const data = await getPosts();
    setPosts(data);
    setLoading(false);
  };

  const loadVideosForComposer = async () => {
    const videos = await getCuratedVideos();
    setAvailableVideos(videos);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !postContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await createPost(profile.id, postContent, selectedVideoId || undefined);
    if (res.success && res.post) {
      setPosts((prev) => [res.post!, ...prev]);
      setPostContent('');
      setSelectedVideoId('');
    }
    setIsSubmitting(false);
  };

  const handleToggleReactions = async (postId: string) => {
    if (!profile) return;
    const current = reactionsMap[postId] || { count: 0, userReacted: false };
    if (current.userReacted) {
      await removeReaction(profile.id, 'post', postId);
      setReactionsMap((prev) => ({
        ...prev,
        [postId]: { count: Math.max(0, current.count - 1), userReacted: false },
      }));
    } else {
      await addReaction(profile.id, 'post', postId, '❤️');
      setReactionsMap((prev) => ({
        ...prev,
        [postId]: { count: current.count + 1, userReacted: true },
      }));
    }
  };

  const handleToggleCommentsView = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    setActiveCommentPostId(postId);
    const fetchedComments = await getComments({ postId });
    setCommentsMap((prev) => ({ ...prev, [postId]: fetchedComments }));
  };

  const handleAddCommentToPost = async (postId: string, parentCommentId?: string) => {
    if (!profile) return;
    const key = parentCommentId ? `${postId}_${parentCommentId}` : postId;
    const text = replyContentMap[key];
    if (!text || !text.trim()) return;

    const res = await addComment(profile.id, text, { postId, parentCommentId });
    if (res.success) {
      setReplyContentMap((prev) => ({ ...prev, [key]: '' }));
      const updated = await getComments({ postId });
      setCommentsMap((prev) => ({ ...prev, [postId]: updated }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-cozia-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">Community Feed</h1>
          <p className="text-xs text-cozia-ink-dim mt-1">
            See posts, shared recommendations, and discussions from the family community.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-cozia-gold font-mono font-semibold px-3 py-1.5 rounded-xl bg-cozia-gold/10 border border-cozia-gold/20">
          <Sparkles className="w-4 h-4" />
          <span>Social Feed</span>
        </div>
      </div>

      {/* Post Composer */}
      {profile && (
        <form onSubmit={handleCreatePost} className="p-5 rounded-2xl bg-cozia-surface border border-cozia-line space-y-4 shadow-xl">
          <div className="flex items-start gap-3">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
              alt={profile.displayName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-cozia-gold/30"
            />
            <div className="flex-1 space-y-3">
              <textarea
                rows={3}
                placeholder="Share a thought, review, or video pick with the community..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-3 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink placeholder-cozia-ink-faint focus:outline-none focus:border-cozia-gold transition-all"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Attach Video Selector */}
                <select
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink-dim focus:outline-none focus:border-cozia-gold transition-all"
                >
                  <option value="">Attach a Curated Video (Optional)...</option>
                  {availableVideos.map((v) => (
                    <option key={v.id} value={v.id}>
                      [{v.provider.toUpperCase()}] {v.title}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!postContent.trim() || isSubmitting}
                  className="px-5 py-2 rounded-xl bg-cozia-gold text-cozia-bg font-semibold text-xs hover:bg-cozia-gold-dim transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Feed List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-cozia-ink-dim gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-mono">Loading community feed...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-cozia-surface border border-cozia-line space-y-3">
          <Sparkles className="w-8 h-8 text-cozia-gold mx-auto" />
          <h3 className="font-serif text-lg font-medium">Feed is Quiet</h3>
          <p className="text-xs text-cozia-ink-dim max-w-sm mx-auto">
            Be the first to create a post or share a curated video pick above!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const reactionState = reactionsMap[post.id] || { count: post.likesCount, userReacted: false };
            const commentsList = commentsMap[post.id] || [];
            const isCommentsOpen = activeCommentPostId === post.id;

            return (
              <div key={post.id} className="p-6 rounded-2xl bg-cozia-surface border border-cozia-line space-y-4 shadow-lg">
                {/* Author Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                      alt={post.author?.displayName || 'User'}
                      loading="lazy"
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-serif text-sm font-medium text-cozia-ink">{post.author?.displayName || 'Cozia Member'}</h4>
                      <p className="text-[11px] font-mono text-cozia-ink-faint">@{post.author?.username || 'member'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cozia-ink-faint">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs text-cozia-ink leading-relaxed font-sans">{post.content}</p>

                {/* Attached Video Card */}
                {post.curatedVideo && (
                  <div className="p-3 rounded-xl bg-cozia-bg border border-cozia-line/80 flex items-center gap-3">
                    <img
                      src={post.curatedVideo.thumbnailUrl}
                      alt={post.curatedVideo.title}
                      loading="lazy"
                      className="w-24 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-cozia-surface-2 text-cozia-gold">
                        {post.curatedVideo.provider}
                      </span>
                      <h5 className="font-serif text-xs font-medium text-cozia-ink line-clamp-1">{post.curatedVideo.title}</h5>
                      <p className="text-[10px] text-cozia-ink-dim line-clamp-1">{post.curatedVideo.description}</p>
                    </div>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex items-center gap-6 border-t border-cozia-line/60 pt-3 text-xs text-cozia-ink-dim">
                  <button
                    onClick={() => handleToggleReactions(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      reactionState.userReacted ? 'text-red-400 font-semibold' : 'hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${reactionState.userReacted ? 'fill-red-400 text-red-400' : ''}`} />
                    <span>{reactionState.count}</span>
                  </button>

                  <button
                    onClick={() => handleToggleCommentsView(post.id)}
                    className="flex items-center gap-1.5 hover:text-cozia-gold transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comments ({commentsList.length})</span>
                  </button>
                </div>

                {/* Threaded Comments Drawer */}
                {isCommentsOpen && (
                  <div className="pt-4 border-t border-cozia-line/60 space-y-4">
                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={replyContentMap[post.id] || ''}
                        onChange={(e) => setReplyContentMap((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
                      />
                      <button
                        onClick={() => handleAddCommentToPost(post.id)}
                        className="px-3.5 py-2 rounded-xl bg-cozia-gold text-cozia-bg text-xs font-semibold hover:bg-cozia-gold-dim transition-all"
                      >
                        Send
                      </button>
                    </div>

                    {/* Comments List & Threading */}
                    <div className="space-y-3">
                      {commentsList.map((c) => (
                        <div key={c.id} className="p-3 rounded-xl bg-cozia-bg/60 border border-cozia-line/40 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-cozia-ink">@{c.author?.username || 'user'}</span>
                            <span className="text-[10px] text-cozia-ink-faint">{new Date(c.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-cozia-ink-dim">{c.content}</p>

                          {/* Nested Replies */}
                          {c.replies && c.replies.length > 0 && (
                            <div className="pl-4 border-l border-cozia-gold/30 space-y-2 pt-2">
                              {c.replies.map((reply) => (
                                <div key={reply.id} className="text-[11px] space-y-0.5">
                                  <span className="font-semibold text-cozia-gold">@{reply.author?.username || 'user'}</span>
                                  <p className="text-cozia-ink-dim">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
