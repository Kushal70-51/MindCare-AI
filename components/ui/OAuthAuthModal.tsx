'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, User, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OAuthAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'Google' | 'Microsoft';
  onAuthenticated: (user: any) => void;
}

export const OAuthAuthModal: React.FC<OAuthAuthModalProps> = ({
  isOpen,
  onClose,
  provider,
  onAuthenticated,
}) => {
  const isGoogle = provider === 'Google';

  const defaultEmails = isGoogle
    ? [
        { email: 'alex.vance@gmail.com', name: 'Dr. Alex Vance', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        { email: 'patient.care@gmail.com', name: 'Patient Account', avatar: '' },
      ]
    : [
        { email: 'alex.vance@outlook.com', name: 'Alex Vance (Microsoft)', avatar: '' },
        { email: 'alex.vance@healthsaas.onmicrosoft.com', name: 'Alex Vance (Healthcare Org)', avatar: '' },
      ];

  const [selectedEmail, setSelectedEmail] = useState(defaultEmails[0].email);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthenticate = async () => {
    setError(null);
    setLoading(true);

    const emailToUse = isCustom ? customEmail : selectedEmail;
    const matched = defaultEmails.find((d) => d.email === selectedEmail);
    const nameToUse = isCustom ? customName || 'Authenticated User' : matched?.name || 'Authenticated User';
    const avatarToUse = matched?.avatar || '';

    if (!emailToUse) {
      setError('Please enter or select a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider.toLowerCase(),
          email: emailToUse,
          fullName: nameToUse,
          avatarUrl: avatarToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to authenticate with ${provider}`);
      }

      onAuthenticated(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'OAuth connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden space-y-0"
        >
          {/* Header Bar styled according to provider branding */}
          <div
            className={`p-6 text-white flex items-center justify-between ${
              isGoogle
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600'
                : 'bg-gradient-to-r from-cyan-600 via-blue-700 to-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                {isGoogle ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
                    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H1z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H1z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight">
                  {provider} Single Sign-On
                </h3>
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
                Choose an account to continue to <span className="text-teal-600">MindCare AI</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Securely sync your assessment telemetry and report records.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Account List */}
            <div className="space-y-2">
              {defaultEmails.map((item) => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => {
                    setSelectedEmail(item.email);
                    setIsCustom(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    !isCustom && selectedEmail === item.email
                      ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {item.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.email}</p>
                    </div>
                  </div>
                  {!isCustom && selectedEmail === item.email && (
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  )}
                </button>
              ))}

              {/* Custom Email Option */}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isCustom
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Use another account</p>
                    <p className="text-[11px] text-slate-500">Sign in with a different {provider} email</p>
                  </div>
                </div>
                {isCustom && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </button>
            </div>

            {/* Custom Input Fields if selected */}
            {isCustom && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    {provider} Account Email
                  </label>
                  <input
                    type="email"
                    placeholder={isGoogle ? 'user@gmail.com' : 'user@outlook.com'}
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Permissions summary */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Requested Permissions:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                <li>Read basic profile info (name, email & profile photo)</li>
                <li>Establish HIPAA-encrypted session token in SQLite</li>
              </ul>
            </div>

            {/* CTA */}
            <button
              onClick={handleAuthenticate}
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                isGoogle
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              {loading ? (
                <span>Authenticating with {provider}...</span>
              ) : (
                <>
                  <span>Sign In with {provider}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
