import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName || !username) {
          setErrorMsg('Please enter a display name and handle.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, displayName, username);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cozia-bg/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-cozia-surface border border-cozia-line rounded-2xl shadow-2xl p-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cozia-gold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface-2 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cozia-gold/10 text-cozia-gold mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-medium tracking-tight">
            {isSignUp ? 'Join Cozia' : 'Welcome back'}
          </h2>
          <p className="text-sm text-cozia-ink-dim mt-1">
            {isSignUp
              ? 'Create an account to save lists & join the community'
              : 'Sign in to access your saved lists and community feed'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-cozia-ink-faint" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex River"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-cozia-ink text-sm focus:outline-none focus:border-cozia-gold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Username / Handle</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-cozia-ink-faint">@</span>
                  <input
                    type="text"
                    required
                    placeholder="alexriver"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-cozia-ink text-sm focus:outline-none focus:border-cozia-gold transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-cozia-ink-faint" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-cozia-ink text-sm focus:outline-none focus:border-cozia-gold transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cozia-ink-dim mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cozia-ink-faint" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cozia-bg border border-cozia-line text-cozia-ink text-sm focus:outline-none focus:border-cozia-gold transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-cozia-gold text-cozia-bg font-semibold hover:bg-cozia-gold-dim transition-all shadow-lg shadow-cozia-gold/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div className="mt-6 text-center text-xs text-cozia-ink-dim border-t border-cozia-line pt-4">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                }}
                className="text-cozia-gold hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(null);
                }}
                className="text-cozia-gold hover:underline font-medium"
              >
                Create One
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
