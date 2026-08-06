import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe, Twitter, Youtube, Key, Check, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface EditProfileProps {
  onBack: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ onBack }) => {
  const { profile, updateProfile, setParentalPin } = useAuth();

  const [displayName, setDisplayName] = useState<string>(profile?.displayName || '');
  const [username, setUsername] = useState<string>(profile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatarUrl || '');
  const [bio, setBio] = useState<string>(profile?.bio || '');
  const [websiteUrl, setWebsiteUrl] = useState<string>(profile?.websiteUrl || '');
  const [twitter, setTwitter] = useState<string>(profile?.socialLinks?.twitter || '');
  const [youtube, setYoutube] = useState<string>(profile?.socialLinks?.youtube || '');
  const [newPin, setNewPin] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setLoading(true);

    try {
      await updateProfile({
        displayName,
        username,
        avatarUrl,
        bio,
        websiteUrl,
        socialLinks: { twitter, youtube },
      });

      if (newPin && newPin.length === 4) {
        await setParentalPin(newPin);
      }

      setSuccessMsg('Profile settings updated successfully!');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-cozia-line pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-cozia-ink-dim hover:text-cozia-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>
        <h1 className="font-serif text-xl font-medium tracking-tight">Edit Profile Settings</h1>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-cozia-surface border border-cozia-line rounded-2xl p-6 shadow-xl">
        {/* Avatar Preview Row */}
        <div className="flex items-center gap-5 pb-6 border-b border-cozia-line">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
            alt="Avatar Preview"
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-cozia-gold/40"
          />
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-medium text-cozia-ink-dim">Avatar Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-cozia-ink-faint" />
              <input
                type="url"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
              />
            </div>
            <p className="text-[10px] text-cozia-ink-faint">Paste an image link or upload to Supabase Storage</p>
          </div>
        </div>

        {/* Identity Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Username / Handle</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Bio Description</label>
          <textarea
            rows={3}
            placeholder="Tell the Cozia community about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
          />
        </div>

        {/* Website & Socials */}
        <div className="space-y-4 pt-2 border-t border-cozia-line">
          <h3 className="text-xs font-semibold text-cozia-gold uppercase tracking-wider">Web & Social Links</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-cozia-ink-dim mb-1">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-cozia-ink-faint" />
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-cozia-ink-dim mb-1">Twitter / X Handle</label>
              <div className="relative">
                <Twitter className="absolute left-3 top-2.5 w-4 h-4 text-cozia-ink-faint" />
                <input
                  type="text"
                  placeholder="@handle"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-cozia-ink-dim mb-1">YouTube Channel</label>
              <div className="relative">
                <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-cozia-ink-faint" />
                <input
                  type="text"
                  placeholder="Channel Name or @handle"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-cozia-bg border border-cozia-line text-xs text-cozia-ink focus:outline-none focus:border-cozia-gold transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Parental PIN Section */}
        <div className="pt-4 border-t border-cozia-line space-y-3">
          <h3 className="text-xs font-semibold text-cozia-teal uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            <span>Parental PIN Lock</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              type="password"
              maxLength={4}
              placeholder="New 4-digit PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-40 px-3 py-2 text-center tracking-[0.3em] font-mono text-sm rounded-xl bg-cozia-bg border border-cozia-line text-cozia-gold focus:outline-none focus:border-cozia-teal transition-all"
            />
            <p className="text-[11px] text-cozia-ink-faint">
              Set a 4-digit PIN to lock Kids Mode and prevent unauthorized changes.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cozia-gold text-cozia-bg font-semibold text-xs hover:bg-cozia-gold-dim transition-all shadow-lg shadow-cozia-gold/10 disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
