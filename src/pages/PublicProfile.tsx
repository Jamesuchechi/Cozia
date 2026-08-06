import React from 'react';
import { UserProfile } from '../types';
import { Globe, Twitter, Youtube, Bookmark, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PublicProfileProps {
  profile: UserProfile | null;
  onNavigateEdit: () => void;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ profile, onNavigateEdit }) => {
  const { profile: currentUserProfile } = useAuth();
  const isOwnProfile = currentUserProfile?.id === profile?.id || !profile;
  const activeProfile = profile || currentUserProfile;

  if (!activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-cozia-ink-dim">
        <p>No profile selected.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Banner & Header */}
      <div className="relative rounded-3xl bg-cozia-surface border border-cozia-line overflow-hidden shadow-2xl">
        {/* Banner Image or Gradient */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-cozia-surface-2 via-cozia-gold/20 to-cozia-teal/20 relative">
          {activeProfile.bannerUrl && (
            <img src={activeProfile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Identity Row */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16 sm:-mt-20">
            {/* Avatar */}
            <img
              src={
                activeProfile.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
              }
              alt={activeProfile.displayName}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover ring-4 ring-cozia-bg shadow-2xl bg-cozia-surface"
            />

            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
                  {activeProfile.displayName}
                </h1>
                {activeProfile.role === 'admin' && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-cozia-gold/20 border border-cozia-gold/30 text-cozia-gold">
                    Admin Curator
                  </span>
                )}
              </div>
              <p className="text-sm font-mono text-cozia-ink-dim">@{activeProfile.username}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwnProfile && (
            <button
              onClick={onNavigateEdit}
              className="px-5 py-2.5 rounded-xl bg-cozia-surface-2 border border-cozia-line text-cozia-ink text-xs font-semibold hover:border-cozia-gold transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-cozia-gold" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Bio & Links Bar */}
        <div className="px-6 pb-6 border-t border-cozia-line/60 pt-4 flex flex-col sm:flex-row justify-between gap-6 text-xs text-cozia-ink-dim">
          <div className="max-w-2xl space-y-3">
            <p className="text-cozia-ink text-sm leading-relaxed font-sans">
              {activeProfile.bio || 'No bio provided yet.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-cozia-ink-dim">
              {activeProfile.websiteUrl && (
                <a
                  href={activeProfile.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-cozia-gold transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{activeProfile.websiteUrl.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {activeProfile.socialLinks?.twitter && (
                <span className="flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>{activeProfile.socialLinks.twitter}</span>
                </span>
              )}
              {activeProfile.socialLinks?.youtube && (
                <span className="flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>{activeProfile.socialLinks.youtube}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(activeProfile.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          {/* Social Stats Counter */}
          <div className="flex items-center gap-6 self-start sm:self-center">
            <div className="text-center px-4 py-2 rounded-xl bg-cozia-bg/40 border border-cozia-line">
              <span className="block text-lg font-serif font-semibold text-cozia-gold">
                {activeProfile.followersCount || 142}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-cozia-ink-faint">Followers</span>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-cozia-bg/40 border border-cozia-line">
              <span className="block text-lg font-serif font-semibold text-cozia-ink">
                {activeProfile.followingCount || 38}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-cozia-ink-faint">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs & Saved Content Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-cozia-line pb-3 text-xs font-semibold">
          <button className="px-4 py-2 rounded-xl bg-cozia-gold text-cozia-bg font-bold flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            <span>Saved Playlists & List</span>
          </button>
          <button className="px-4 py-2 rounded-xl hover:bg-cozia-surface text-cozia-ink-dim hover:text-cozia-ink transition-all">
            Activity Feed
          </button>
        </div>

        {/* Empty or Saved Items Placeholder */}
        <div className="p-8 rounded-2xl bg-cozia-surface border border-cozia-line text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cozia-gold/10 text-cozia-gold mx-auto flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-medium">No Saved Videos Yet</h3>
          <p className="text-xs text-cozia-ink-dim max-w-sm mx-auto">
            Videos added to "+ My List" will appear here on your public profile page.
          </p>
        </div>
      </div>
    </div>
  );
};
