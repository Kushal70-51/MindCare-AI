'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  MessageSquare,
  Globe,
  Video,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SocialConnectScreen: React.FC = () => {
  const { setScreen, socialPlatforms, toggleSocialPlatform, updateSocialHandle, showToast } = useApp();

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return (
          <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case 'Reddit':
        return <MessageSquare className="w-5 h-5 text-orange-500" />;
      case 'Twitter (X)':
        return (
          <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'Facebook':
        return (
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'YouTube':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'LinkedIn':
        return (
          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
        );
      default:
        return <Share2 className="w-5 h-5 text-teal-400" />;
    }
  };

  const handleToggle = (id: string, platformName: string, currentStatus: boolean) => {
    toggleSocialPlatform(id);
    if (!currentStatus) {
      showToast(`Connected ${platformName} to assessment pipeline`);
    } else {
      showToast(`Disconnected ${platformName}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-white/10 text-teal-300 text-xs font-semibold"
        >
          <ShieldAlert className="w-4 h-4 text-teal-400" />
          <span>Optional Contextual Data Feed</span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
          Connect Your Social Media Accounts
        </h1>

        <p className="text-sm text-slate-300">
          Connect only the platforms you wish to share for AI-assisted assessment. Social markers provide contextual sentiment signals for SHAP explainability.
        </p>
      </div>

      {/* Grid of 6 Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {socialPlatforms.map((platform, idx) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`p-5 rounded-3xl backdrop-blur-xl border transition-all space-y-4 shadow-xl flex flex-col justify-between ${
              platform.connected
                ? 'bg-slate-900/90 border-teal-400/50 shadow-teal-500/10'
                : 'bg-slate-900/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-white/10">
                    {getPlatformIcon(platform.platform)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{platform.platform}</h3>
                    <p className="text-[11px] text-slate-400">{platform.description}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    platform.connected
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                      : 'bg-slate-800 text-slate-400 border border-white/10'
                  }`}
                >
                  {platform.connected ? 'Connected' : 'Not Linked'}
                </span>
              </div>

              {/* Handle Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Account Handle / URL
                </label>
                <input
                  type="text"
                  value={platform.handle}
                  onChange={(e) => updateSocialHandle(platform.id, e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
                />
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => handleToggle(platform.id, platform.platform, platform.connected)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                platform.connected
                  ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15'
              }`}
            >
              {platform.connected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Linked & Authorized</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-slate-400" />
                  <span>Connect {platform.platform}</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
        <button
          onClick={() => setScreen('dashboard')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
        >
          Skip for Now
        </button>

        <button
          onClick={() => setScreen('dashboard')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-xl hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to Assessment Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
