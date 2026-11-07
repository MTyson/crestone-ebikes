import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Sparkles } from 'lucide-react';
import { sendMagicLinkEmail } from '../services/listingsService';
import { AppUser } from '../types/listing';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignedIn: (user: AppUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await sendMagicLinkEmail(email);
      if (result.mode === 'supabase') {
        setSentMessage(
          `Check your inbox at ${email}! Click the magic link to sign in to Crestone E-Bikes.`
        );
      } else if (result.user) {
        onSignedIn(result.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="font-serif-display text-2xl font-bold text-stone-900">
          Passwordless Email Sign-In
        </h2>
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          No passwords to remember. Enter your email to get a simple one-click sign-in link to
          manage your Crestone E-Bikes listings.
        </p>

        {sentMessage ? (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>{sentMessage}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@crestone.org"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-700"
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              {loading
                ? 'Sending Link...'
                : isSupabaseConfigured
                ? 'Send Magic Link Email'
                : 'Sign In Instantly (Prototype Mode)'}
            </button>

            <div className="p-3 rounded-xl bg-stone-100 text-xs text-stone-600 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {isSupabaseConfigured
                  ? 'Powered by Supabase Auth OTP.'
                  : 'Prototype Mode: Clicking above simulates clicking the Supabase Magic Link so you can test signed-in features right away.'}
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

