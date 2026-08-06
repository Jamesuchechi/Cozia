import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ParentalPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'enter_pin' | 'set_pin';
}

export const ParentalPinModal: React.FC<ParentalPinModalProps> = ({ isOpen, onClose, mode }) => {
  const { toggleKidsMode, setParentalPin, isKidsMode } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setErrorMsg('Please enter a valid 4-digit PIN.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'set_pin') {
        await setParentalPin(pin);
        onClose();
      } else {
        const res = await toggleKidsMode(pin);
        if (!res.success) {
          setErrorMsg(res.error || 'Incorrect PIN.');
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cozia-bg/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-cozia-surface border border-cozia-line rounded-2xl shadow-2xl p-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-cozia-ink-dim hover:text-cozia-ink hover:bg-cozia-surface-2 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cozia-teal/10 text-cozia-teal mb-3">
          {mode === 'set_pin' ? <Key className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
        </div>

        <h3 className="font-serif text-xl font-medium tracking-tight mb-1">
          {mode === 'set_pin' ? 'Set 4-Digit Parental PIN' : isKidsMode ? 'Exit Kids Mode' : 'Enter Parental PIN'}
        </h3>

        <p className="text-xs text-cozia-ink-dim mb-6">
          {mode === 'set_pin'
            ? 'Set a PIN to lock settings and restrict feed access'
            : isKidsMode
            ? 'Enter your 4-digit PIN to exit Kids Mode'
            : 'Enter PIN to confirm parental authorization'}
        </p>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <div className="relative max-w-[160px]">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-cozia-ink-faint" />
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center tracking-[0.5em] font-mono text-lg py-2 pl-8 pr-4 rounded-xl bg-cozia-bg border border-cozia-line text-cozia-gold focus:outline-none focus:border-cozia-gold transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="w-full py-2.5 rounded-xl bg-cozia-teal text-cozia-bg font-semibold hover:opacity-90 transition-all disabled:opacity-40"
          >
            {loading ? 'Verifying...' : mode === 'set_pin' ? 'Save PIN' : 'Confirm'}
          </button>
        </form>
      </div>
    </div>
  );
};
