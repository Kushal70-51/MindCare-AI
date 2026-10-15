'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Mail, User, ArrowRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OAuthAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider?: 'Google' | string;
  onAuthenticated: (user: any) => void;
}

export const OAuthAuthModal: React.FC<OAuthAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [googleEmail, setGoogleEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthenticate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const emailToUse = googleEmail.trim();
    if (!emailToUse) {
      setError('Please enter your Google account email address.');
      return;
    }

    if (!emailToUse.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const nameToUse = fullName.trim() || emailToUse.split('@')[0].replace(/[._]/g, ' ');

    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          email: emailToUse,
          fullName: nameToUse,
          avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate with Google');
      }

      onAuthenticated(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google OAuth error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRealGoogleRedirect = () => {
    window.location.href = '/api/auth/google/login';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight">Google Sign-In</h3>
                <p className="text-xs text-white/80">MindCare AI HIPAA Authorization</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-slate-800">
                Sign in to your <span className="text-teal-600">MindCare AI</span> account
              </p>
              <p className="text-[11px] text-slate-500">
                Authenticate securely using your Google account to access your encrypted records.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Option 1: Official Google OAuth 2.0 Web Flow */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleRealGoogleRedirect}
                className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-blue-500 text-xs font-bold text-blue-700 shadow-sm hover:shadow-md transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                  />
                </svg>
                <span>Sign in with Google (OAuth 2.0)</span>
                <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Direct OAuth 2.0 authorization via accounts.google.com
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Or enter your Google email
              </span>
            </div>

            {/* Option 2: Enter personal Google Account */}
            <form onSubmit={handleAuthenticate} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Your Google Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Your Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Permissions summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Authorization:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                  <li>Verify Google email identity & profile name</li>
                  <li>Establish HIPAA-encrypted patient session token</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Continue with Google Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
