import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CuratedVideo } from '../types';
import { getCuratedVideos } from '../lib/curation';
import { UniversalVideoPlayer } from '../components/player/UniversalVideoPlayer';
import { Tv2, Users, Send, Sparkles, Copy, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  text: string;
  time: string;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  left: number; // percentage
}

export const WatchParty: React.FC = () => {
  const { roomId: urlRoomId } = useParams<{ roomId?: string }>();
  const { profile } = useAuth();

  const roomId = urlRoomId || 'default-lounge';

  const [videos, setVideos] = useState<CuratedVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<CuratedVideo | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');

  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const list = await getCuratedVideos();
    setVideos(list);
    if (list.length > 0) {
      setCurrentVideo(list[0]);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    // Connect to Supabase Realtime Broadcast channel for room synchronization
    const channel = supabase.channel(`watch_party_${roomId}`, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on('broadcast', { event: 'chat' }, (payload) => {
        setChatMessages((prev) => [...prev, payload.payload as ChatMessage]);
      })
      .on('broadcast', { event: 'reaction' }, (payload) => {
        triggerEmojiAnimation(payload.payload.emoji);
      })
      .on('broadcast', { event: 'change_video' }, (payload) => {
        if (payload.payload.video) {
          setCurrentVideo(payload.payload.video);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const triggerEmojiAnimation = (emoji: string) => {
    const id = `emoji-${Date.now()}-${Math.random()}`;
    const left = Math.floor(Math.random() * 80) + 10;
    setFloatingEmojis((prev) => [...prev, { id, emoji, left }]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2500);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !channelRef.current) return;

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: profile?.displayName || 'Guest Viewer',
      avatar: profile?.avatarUrl,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: msg,
    });

    setChatInput('');
  };

  const handleSendReaction = (emoji: string) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji },
    });
  };

  const handleSelectRoomVideo = (video: CuratedVideo) => {
    setCurrentVideo(video);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'change_video',
        payload: { video },
      });
    }
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in relative">
      {/* Animated Emoji Reactions Floating Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            style={{ left: `${item.left}%` }}
            className="absolute bottom-10 text-4xl animate-bounce transition-all duration-1000 opacity-90"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Room Header & Share Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-cozia-line pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tv2 className="w-6 h-6 text-cozia-gold" />
            <h1 className="font-serif text-2xl font-medium tracking-tight">Watch Together Lounge</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-cozia-gold/20 text-cozia-gold border border-cozia-gold/30">
              Room: {roomId}
            </span>
          </div>
          <p className="text-xs text-cozia-ink-dim mt-1">
            Synchronized multi-platform playback room for YouTube, Vimeo, Dailymotion & Twitch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cozia-teal px-3 py-1.5 rounded-xl bg-cozia-teal/10 border border-cozia-teal/20">
            <Users className="w-4 h-4" />
            <span>Synced Lounge</span>
          </div>

          <button
            onClick={handleCopyShareLink}
            className="px-4 py-2 rounded-xl bg-cozia-gold text-cozia-bg text-xs font-semibold hover:bg-cozia-gold-dim transition-all flex items-center gap-1.5 shadow-lg"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Room Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player + Realtime Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Synced Video Player Box (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {currentVideo ? (
            <UniversalVideoPlayer video={currentVideo} allVideos={videos} onSelectVideo={handleSelectRoomVideo} />
          ) : (
            <div className="aspect-video w-full rounded-2xl bg-cozia-surface flex items-center justify-center text-xs font-mono text-cozia-ink-dim border border-cozia-line">
              Loading Watch Together Player...
            </div>
          )}

          {/* Quick Playlist Selector */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-cozia-gold uppercase tracking-wider">Switch Room Video</h4>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelectRoomVideo(v)}
                  className={`flex-shrink-0 w-44 p-2 rounded-xl border transition-all text-left space-y-1 ${
                    currentVideo?.id === v.id
                      ? 'bg-cozia-surface-2 border-cozia-gold text-cozia-gold'
                      : 'bg-cozia-surface border-cozia-line text-cozia-ink hover:border-cozia-gold/40'
                  }`}
                >
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-20 rounded-lg object-cover" />
                  <p className="text-[11px] font-medium truncate">{v.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Realtime Room Chat & Reaction Overlay Panel */}
        <div className="flex flex-col h-[520px] rounded-3xl bg-cozia-surface border border-cozia-line p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cozia-line pb-3">
            <h3 className="font-serif text-sm font-semibold text-cozia-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cozia-gold" />
              <span>Room Chat</span>
            </h3>
            <span className="text-[10px] font-mono text-cozia-ink-faint">Live Sync Active</span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin text-xs">
            {chatMessages.length === 0 ? (
              <div className="text-center py-16 text-cozia-ink-faint space-y-1">
                <p>Welcome to Watch Together!</p>
                <p className="text-[10px]">Type a message or react with emojis below.</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 rounded-xl bg-cozia-bg/60 border border-cozia-line/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-cozia-gold">{msg.sender}</span>
                    <span className="text-cozia-ink-faint font-mono">{msg.time}</span>
                  </div>
                  <p className="text-cozia-ink leading-relaxed">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Animated Reaction Emoji Bar */}
          <div className="flex items-center justify-around py-2 border-t border-b border-cozia-line/60 bg-cozia-bg/40 rounded-xl">
            {['❤️', '👏', '🔥', '🎉', '😂', '⭐'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="text-lg hover:scale-125 transition-transform p-1"
                title={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Chat with room..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="px-3.5 py-2 rounded-xl bg-cozia-gold text-cozia-bg hover:bg-cozia-gold-dim transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
