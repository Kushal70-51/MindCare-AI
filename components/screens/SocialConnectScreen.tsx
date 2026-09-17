'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  MessageSquare,
  Video,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  LogIn,
  LogOut,
  RefreshCw,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SocialConnectScreen: React.FC = () => {
  const {
    setScreen,
    socialPlatforms,
    toggleSocialPlatform,
    updateSocialHandle,
    showToast,
    socialInsight,
    socialAnalysisLoading,
    socialAnalysisError,
    analyzeYoutubeVideoUrl,
    youtubeConnected,
    youtubeChannelTitle,
    youtubeProfile,
    youtubeProfileLoading,
    youtubeProfileError,
    connectYoutubeAccount,
    disconnectYoutubeAccount,
    loadYoutubeProfile,
    redditConnected,
    redditUsername,
    redditProfile,
    redditProfileLoading,
    redditProfileError,
    connectRedditAccount,
    disconnectRedditAccount,
    loadRedditProfile,
    instagramProfile,
    instagramAnalysisLoading,
    instagramAnalysisError,
    analyzeInstagramExportFile,
  } = useApp();

  const instagramFileInputRef = useRef<HTMLInputElement | null>(null);
  const [instagramFileName, setInstagramFileName] = useState<string | null>(null);

  const handleInstagramFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInstagramFileName(file.name);
    analyzeInstagramExportFile(file);
  };

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
    <div className="w-full max-w-5xl mx-auto px-4 py-8 text-slate-900 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold"
        >
          <ShieldAlert className="w-4 h-4 text-teal-600" />
          <span>Optional Contextual Data Feed</span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Connect Your Social Media Accounts
        </h1>

        <p className="text-sm text-slate-500">
          Connect only the platforms you wish to share for AI-assisted assessment. Once connected, the
          full analysis appears in your Mental Health Report automatically once you finish an assessment.
        </p>
      </div>

      {/* Grid of 6 Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {socialPlatforms.map((platform, idx) => {
          const isYoutube = platform.id === 'youtube';
          const isReddit = platform.id === 'reddit';
          const isInstagram = platform.id === 'instagram';
          const isConnected = isYoutube
            ? youtubeConnected
            : isReddit
            ? redditConnected
            : isInstagram
            ? Boolean(instagramProfile)
            : platform.connected;

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`p-5 rounded-2xl border transition-all space-y-4 shadow-sm flex flex-col justify-between ${
                isConnected
                  ? 'bg-teal-50/50 border-teal-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Platform Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{platform.platform}</h3>
                      <p className="text-[11px] text-slate-500">{platform.description}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                      isConnected
                        ? 'bg-teal-100 text-teal-700 border border-teal-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not Linked'}
                  </span>
                </div>

                {/* ---- YouTube: real Google OAuth sign-in, lives in this card ---- */}
                {isYoutube && (
                  <>
                    {youtubeConnected ? (
                      <>
                        <p className="text-[11px] text-slate-500">
                          Signed in as <strong className="text-slate-700">{youtubeChannelTitle || 'your channel'}</strong>
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={loadYoutubeProfile}
                            disabled={youtubeProfileLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold disabled:opacity-50 transition-all"
                          >
                            {youtubeProfileLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            <span>{youtubeProfile ? 'Refresh' : 'Analyze Now'}</span>
                          </button>
                          <button
                            onClick={disconnectYoutubeAccount}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={connectYoutubeAccount}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign in with Google</span>
                      </button>
                    )}

                    {youtubeProfileError && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{youtubeProfileError}</span>
                      </div>
                    )}
                    {youtubeProfile && (
                      <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[10px] flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Analyzed — see your Mental Health Report.</span>
                      </div>
                    )}

                    {/* Secondary, optional: analyze any public video's comments */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Or Analyze a Video&apos;s Comments
                      </label>
                      <input
                        type="text"
                        value={platform.handle}
                        onChange={(e) => updateSocialHandle(platform.id, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono"
                      />
                      {socialAnalysisError && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{socialAnalysisError}</span>
                        </div>
                      )}
                      {socialInsight && (
                        <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[10px] flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Analyzed — see your Mental Health Report.</span>
                        </div>
                      )}
                      <button
                        onClick={() => analyzeYoutubeVideoUrl(platform.handle)}
                        disabled={!platform.handle.trim() || socialAnalysisLoading}
                        className="w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {socialAnalysisLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Analyzing comments...</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Analyze Comments</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* ---- Reddit: real Reddit OAuth sign-in, lives in this card ---- */}
                {isReddit && (
                  <>
                    {redditConnected ? (
                      <>
                        <p className="text-[11px] text-slate-500">
                          Signed in as <strong className="text-slate-700">u/{redditUsername || 'you'}</strong>
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={loadRedditProfile}
                            disabled={redditProfileLoading}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold disabled:opacity-50 transition-all"
                          >
                            {redditProfileLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            <span>{redditProfile ? 'Refresh' : 'Analyze Now'}</span>
                          </button>
                          <button
                            onClick={disconnectRedditAccount}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={connectRedditAccount}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign in with Reddit</span>
                      </button>
                    )}

                    {redditProfileError && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{redditProfileError}</span>
                      </div>
                    )}
                    {redditProfile && (
                      <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[10px] flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Analyzed — see your Mental Health Report.</span>
                      </div>
                    )}
                  </>
                )}

                {/* ---- Instagram: no OAuth possible (see explanation), so this uses
                    the user's own official data export instead of a live login ---- */}
                {isInstagram && (
                  <>
                    <a
                      href="https://accountscenter.instagram.com/info_and_permissions/dyi/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Instagram Data Export</span>
                    </a>
                    <p className="text-[10px] text-slate-400">
                      Request your export on Instagram&apos;s own site (JSON format — choose &quot;Some of your
                      information&quot; or &quot;All available information&quot;), then come back and upload the
                      file below. Nothing is stored — it&apos;s analyzed and discarded. If the link above shows a
                      blank page, open it manually: Instagram → Settings → Accounts Center → Your Information and
                      Permissions → Download Your Information.
                    </p>

                    <input
                      ref={instagramFileInputRef}
                      type="file"
                      accept=".json,.zip"
                      className="hidden"
                      onChange={handleInstagramFileSelected}
                    />
                    <button
                      onClick={() => instagramFileInputRef.current?.click()}
                      disabled={instagramAnalysisLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold disabled:opacity-50 transition-all"
                    >
                      {instagramAnalysisLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing export...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{instagramFileName ? 'Upload a Different File' : 'Upload Export File'}</span>
                        </>
                      )}
                    </button>

                    {instagramAnalysisError && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{instagramAnalysisError}</span>
                      </div>
                    )}
                    {instagramProfile && (
                      <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[10px] flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Analyzed — see your Mental Health Report.</span>
                      </div>
                    )}
                  </>
                )}

                {/* ---- Other platforms: unchanged mock connect pattern ---- */}
                {!isYoutube && !isReddit && !isInstagram && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                      Account Handle / URL
                    </label>
                    <input
                      type="text"
                      value={platform.handle}
                      onChange={(e) => updateSocialHandle(platform.id, e.target.value)}
                      placeholder="@handle"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {!isYoutube && !isReddit && !isInstagram && (
                <button
                  onClick={() => handleToggle(platform.id, platform.platform, platform.connected)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    platform.connected
                      ? 'bg-teal-100 hover:bg-teal-200 text-teal-700 border border-teal-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {platform.connected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>Linked & Authorized</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-slate-500" />
                      <span>Connect {platform.platform}</span>
                    </>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <button
          onClick={() => setScreen('dashboard')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors"
        >
          Skip for Now
        </button>

        <button
          onClick={() => setScreen('dashboard')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to Assessment Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
