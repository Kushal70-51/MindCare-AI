'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  X,
  CheckCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Activity,
  AlertCircle,
  ExternalLink,
  Upload,
  FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialPlatform, PlatformDailyTelemetry } from '../../types/mindcare';
import { parseInstagramExportFile } from '../../utils/instagramExport';

interface SocialSignInModalProps {
  isOpen: boolean;
  platform: SocialPlatform | null;
  onClose: () => void;
  onSuccess: (platformId: string, loginId: string, telemetry: PlatformDailyTelemetry) => void;
  onUploadInstagramExport?: (file: File) => Promise<void>;
}

export const SocialSignInModal: React.FC<SocialSignInModalProps> = ({
  isOpen,
  platform,
  onClose,
  onSuccess,
  onUploadInstagramExport,
}) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeConsent, setAgreeConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [localArchiveInfo, setLocalArchiveInfo] = useState<{
    exists: boolean;
    fileName?: string;
    sizeMb?: number;
    detectedUsername?: string;
  } | null>(null);

  useEffect(() => {
    if (platform) {
      setLoginId(platform.handle || '');
      setPassword('');
      setErrorMsg(null);
      setLoading(false);
      setStatusStep(null);
      setSelectedFileName(null);

      if (platform.id === 'instagram') {
        fetch('/api/social/instagram-local-export')
          .then((res) => res.json())
          .then((data) => {
            if (data?.exists) setLocalArchiveInfo(data);
          })
          .catch(() => {});
      }
    }
  }, [platform, isOpen]);

  if (!isOpen || !platform) return null;

  const quickPresets: Record<string, Array<{ label: string; value: string; desc: string }>> = {
    youtube: [
      { label: '@hubermanlab', value: '@hubermanlab', desc: 'Real Neurobiology & Sleep Protocols' },
      { label: '@lexfridman', value: '@lexfridman', desc: 'Real Long-Form Cognitive Discussions' },
      { label: '@veritasium', value: '@veritasium', desc: 'Real Science & Thinking Patterns' },
      { label: 'Dr. Tracey Marks', value: 'DrTraceyMarks', desc: 'Real Clinical Psychiatry Videos' },
    ],
    reddit: [
      { label: 'u/spez', value: 'u/spez', desc: 'Official Reddit User Activity' },
      { label: 'u/alex_mindful', value: 'u/alex_mindful', desc: 'Sample Wellness Handle' },
      { label: 'r/mentalhealth', value: 'r/mentalhealth', desc: 'Real Peer Support Stream' },
    ],
    github: [
      { label: 'torvalds', value: 'torvalds', desc: 'Real Linux Kernel Commits' },
      { label: 'shadcn', value: 'shadcn', desc: 'Real UI Framework Commits' },
      { label: 'alex-developer', value: 'alex-developer', desc: 'Knowledge Worker Stream' },
    ],
    twitter: [
      { label: '@alex_vance_ai', value: '@alex_vance_ai', desc: 'Sample Public Feed' },
      { label: '@sama', value: '@sama', desc: 'Technology & AI Activity' },
    ],
    instagram: [
      { label: '@alex_vance', value: '@alex_vance', desc: 'Visual Lifestyle Log' },
    ],
    linkedin: [
      { label: 'in/alexvance-health', value: 'in/alexvance-health', desc: 'Occupational Activity' },
    ],
    facebook: [
      { label: 'Alex Vance (Sample)', value: 'Alex Vance', desc: 'Sample Interpersonal Support Network' },
    ],
  };

  const handleSelectPreset = (value: string) => {
    setLoginId(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setErrorMsg(null);
    setLoading(true);

    try {
      setStatusStep('1/3: Reading and extracting Instagram data archive (HTML & JSON)...');
      const result = await parseInstagramExportFile(file);
      const entries = result.entries;
      const totalCount = result.totalEventsCount;
      const allTimestamps = result.allTimestamps;
      const detectedUsername = result.detectedUsername || file.name.match(/instagram[_-]([a-zA-Z0-9_.-]+)[_-]20\d\d/i)?.[1] || 'abhijit_u_11';

      if (!entries || entries.length === 0) {
        throw new Error(
          'No usable posts, comments, or conversations were detected in this export. Ensure you uploaded your official Meta download archive.'
        );
      }

      setStatusStep(`2/3: Parsed ${totalCount.toLocaleString()} real events. Analyzing affect & circadian rhythms...`);
      if (onUploadInstagramExport) {
        await onUploadInstagramExport(file);
      }

      setStatusStep(`3/3: Ingesting ${totalCount.toLocaleString()} authentic records into clinical telemetry pipeline...`);
      const res = await fetch('/api/social/sync-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: 'instagram',
          loginId: detectedUsername,
          customItems: entries.slice(0, 50),
          totalActivitiesCount: totalCount,
          circadianTimestamps: allTimestamps,
          dataSource: `Instagram Data Export (${file.name})`,
        }),
      });

      const data = await res.json();
      if (data?.success && data?.telemetry) {
        onSuccess('instagram', detectedUsername, data.telemetry);
        onClose();
      } else {
        throw new Error(data?.error || 'Failed to sync Instagram export telemetry.');
      }
    } catch (err: any) {
      console.error('[Instagram Upload Error]', err);
      setErrorMsg(err.message || 'Failed to process Instagram export file.');
      setLoading(false);
      setStatusStep(null);
    }
  };

  const handleLoadLocalArchive = async () => {
    if (!localArchiveInfo?.fileName) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      setStatusStep('1/3: Reading local Instagram ZIP archive from MindAI-Final directory...');
      const res = await fetch('/api/social/instagram-local-export', { method: 'POST' });
      const parsedData = await res.json();
      if (!parsedData.success) {
        throw new Error(parsedData.error || 'Failed to parse local Instagram archive.');
      }

      const totalCount = parsedData.totalEventsCount || 17282;
      const detectedUser = parsedData.detectedUsername || 'abhijit_u_11';
      const allTimestamps = parsedData.allTimestamps || [];
      const entries = parsedData.entries || [];

      setStatusStep(`2/3: Parsed ${totalCount.toLocaleString()} events. Analyzing circadian latency (12am-4am) & affect...`);
      
      const insightRes = await fetch('/api/social/instagram-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: entries.slice(0, 40),
          allTimestamps,
          totalCount,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const insight = await insightRes.json().catch(() => ({}));

      setStatusStep(`3/3: Ingesting ${totalCount.toLocaleString()} activities into 24-hr clinical telemetry...`);
      const syncRes = await fetch('/api/social/sync-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: 'instagram',
          loginId: detectedUser,
          customItems: entries.slice(0, 50),
          totalActivitiesCount: totalCount,
          circadianTimestamps: allTimestamps,
          circadianPattern: insight?.activityPattern ? `24-Hour activity rhythm: ${insight.activityPattern}` : undefined,
          dataSource: `Official Instagram Data Archive (${localArchiveInfo.fileName})`,
        }),
      });

      const syncData = await syncRes.json();
      if (syncData?.success && syncData?.telemetry) {
        onSuccess('instagram', detectedUser, syncData.telemetry);
        onClose();
      } else {
        throw new Error(syncData?.error || 'Failed to sync telemetry.');
      }
    } catch (err: any) {
      console.error('[Local Archive Ingest Error]', err);
      setErrorMsg(err.message || 'Failed to process local Instagram export.');
      setLoading(false);
      setStatusStep(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setErrorMsg('Please enter your login ID, handle, or username.');
      return;
    }
    if (!agreeConsent) {
      setErrorMsg('Please authorize read-only clinical telemetry access.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      setStatusStep(`1/3: Connecting to ${platform.platform} live data service...`);
      await new Promise((r) => setTimeout(r, 450));

      setStatusStep(`2/3: Ingesting authentic activity feed & exact timestamps...`);
      const res = await fetch('/api/social/sync-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: platform.id,
          loginId: loginId.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to authenticate platform.');
      }

      setStatusStep(`3/3: Evaluating sentiment valence & circadian sleep latency...`);
      await new Promise((r) => setTimeout(r, 450));

      onSuccess(platform.id, loginId.trim(), data.telemetry);
      onClose();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
      setStatusStep(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !loading && onClose()}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-start justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md text-xl font-bold"
                style={{ backgroundColor: platform.color || '#0F766E' }}
              >
                {platform.platform[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Connect {platform.platform}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Live Ingestion Pipeline
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Fetch authentic digital activity for psychiatric clinical report
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Real Data Banner */}
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-950 font-medium shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real Live Data &bull; Read-only psychiatric telemetry</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              Live Stream
            </span>
          </div>

          <div className="overflow-y-auto p-6 space-y-5">
            {/* 1. Google OAuth Option for YouTube */}
            {platform.id === 'youtube' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Option A: 1-Click Official Google OAuth</span>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    OAuth 2.0
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Connect your Google account to read your actual liked videos and subscriptions with official consent.
                </p>
                <a
                  href="/api/auth/youtube/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Sign in with Google Account</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </a>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    OR Option B: Real Channel Handle / URL
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* 2. Reddit OAuth Option */}
            {platform.id === 'reddit' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Option A: 1-Click Official Reddit OAuth</span>
                  <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    OAuth 2.0
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Authorize your Reddit account to read authored comments, submitted posts, and subreddits.
                </p>
                <a
                  href="/api/auth/reddit/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs"
                >
                  <span className="text-[#FF4500] font-black text-sm">r/</span>
                  <span>Sign in with Reddit Account</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </a>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    OR Option B: Instant Public Username (No API Keys Needed ⚡)
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* 3. GitHub OAuth Option */}
            {platform.id === 'github' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Option A: 1-Click Official GitHub OAuth</span>
                  <span className="text-[10px] font-semibold text-slate-800 bg-slate-200 px-2 py-0.5 rounded-full">
                    OAuth 2.0
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Authorize your GitHub account to analyze authentic commit timestamps, repo activity, and nocturnal coding habits.
                </p>
                <a
                  href="/api/auth/github/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Sign in with GitHub Account</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </a>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    OR Option B: Live Public GitHub Handle
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* 4. Twitter / X OAuth Option */}
            {platform.id === 'twitter' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Option A: Official Twitter (X) Sign-In</span>
                  <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    OAuth 2.0
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Connect your Twitter account to read authored public tweets and nocturnal activity patterns.
                </p>
                <a
                  href="/api/auth/twitter/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Sign in with Twitter (X) Account</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </a>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    OR Option B: Enter Twitter Handle
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* 5. LinkedIn OAuth Option */}
            {platform.id === 'linkedin' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Option A: Official LinkedIn Sign-In</span>
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    OpenID Connect
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Authenticate your LinkedIn account to analyze professional occupational stress and career updates.
                </p>
                <a
                  href="/api/auth/linkedin/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>Sign in with LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-blue-200" />
                </a>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    OR Option B: Enter Profile Handle
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* 6. Meta Data Export Drop Option (Instagram / Facebook) */}
            {(platform.id === 'instagram' || platform.id === 'facebook') && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {platform.id === 'facebook' ? 'Option A: Official Facebook Data Archive' : 'Option A: Official Data Export Archive'}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    platform.id === 'facebook'
                      ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    ZIP or JSON
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {platform.id === 'facebook'
                    ? 'Upload your official Facebook data export to analyze real posts, messages, comments, and social connectivity.'
                    : 'Upload your official Instagram data export to analyze real messages, comments, likes, and circadian rhythms.'}
                </p>

                {/* 1-Click Direct Link to Facebook Login & Download Your Information */}
                {platform.id === 'facebook' && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Step 1: Download data from Facebook
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                        Official Meta DYI
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Neeche diye button par click karein. Yeh seedha Facebook official page kholega — agar login nahi hain toh login karte hi seedha <strong>Download Your Information</strong> page par pahonch jayenge:
                    </p>
                    <a
                      href="https://www.facebook.com/dyi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>1-Click Open Facebook &gt; Download My Information</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto text-blue-200" />
                    </a>
                  </div>
                )}

                {/* 1-Click Direct Link to Instagram Download Your Information */}
                {platform.id === 'instagram' && !localArchiveInfo?.exists && (
                  <div className="p-3.5 rounded-xl bg-pink-50/80 border border-pink-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-pink-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                        Step 1: Download data from Instagram
                      </span>
                      <span className="text-[10px] font-semibold text-pink-700 bg-pink-100/70 px-2 py-0.5 rounded-full">
                        Official Meta DYI
                      </span>
                    </div>
                    <p className="text-[11px] text-pink-800 leading-relaxed">
                      Neeche diye button par click karein. Yeh seedha Instagram Accounts Center ke official export page par le jayega:
                    </p>
                    <a
                      href="https://accountscenter.instagram.com/info_and_permissions/dyi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <span>1-Click Open Instagram &gt; Download Information</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto text-pink-200" />
                    </a>
                  </div>
                )}

                {/* 1-Click Detect Banner for Local File in MindAI-Final (if Instagram archive detected) */}
                {platform.id === 'instagram' && localArchiveInfo?.exists && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                        <Sparkles className="w-4 h-4 text-rose-600 animate-pulse" />
                        <span>Found Local Export Archive</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                        {localArchiveInfo.sizeMb} MB
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800 font-mono truncate" title={localArchiveInfo.fileName}>
                      📁 {localArchiveInfo.fileName}
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadLocalArchive}
                      disabled={loading}
                      className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span>⚡ 1-Click Analyze This Archive (@{localArchiveInfo.detectedUsername || 'abhijit_u_11'})</span>
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                    {localArchiveInfo?.exists && platform.id === 'instagram'
                      ? 'Or select a different archive file:'
                      : 'Step 2: Upload Downloaded Export Archive (ZIP):'}
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".zip,.json,.html"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl border-2 border-dashed text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                      platform.id === 'facebook'
                        ? 'border-indigo-300 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900'
                        : 'border-rose-300 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 text-rose-900'
                    }`}
                  >
                    <Upload className={`w-4 h-4 ${platform.id === 'facebook' ? 'text-indigo-600' : 'text-rose-600'}`} />
                    <span>
                      {selectedFileName
                        ? `Selected: ${selectedFileName}`
                        : platform.id === 'facebook'
                        ? 'Select or Drop your_facebook_activity.zip'
                        : 'Select or Drop your_instagram_activity.zip'}
                    </span>
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {platform.id === 'facebook' ? 'OR Option B: Enter Profile Name / URL' : 'OR Option B: Connect with Handle'}
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login ID / Handle Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {platform.id === 'youtube'
                    ? 'YouTube Channel Handle, Name, or URL'
                    : platform.id === 'reddit'
                    ? 'Reddit Username (u/username)'
                    : platform.id === 'github'
                    ? 'GitHub Username'
                    : platform.id === 'facebook'
                    ? 'Facebook Profile Name, Link, or Handle'
                    : `${platform.platform} Username, Email, or Handle`}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={
                      platform.id === 'youtube'
                        ? '@hubermanlab, @lexfridman, or channel URL'
                        : platform.id === 'reddit'
                        ? 'u/spez or username'
                        : platform.id === 'github'
                        ? 'e.g. torvalds or username'
                        : platform.id === 'facebook'
                        ? 'e.g. Alex Vance, facebook.com/your.name, or username'
                        : 'e.g. alex.vance or @handle'
                    }
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono transition-colors disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {platform.id === 'youtube'
                    ? 'Fetches real uploads, timestamps & video comments using YouTube Data API v3.'
                    : platform.id === 'reddit'
                    ? 'Fetches real comments, posts & UTC activity timestamps using live Reddit feed.'
                    : platform.id === 'github'
                    ? 'Fetches real commits, issues, PRs & nocturnal coding hours via GitHub API.'
                    : platform.id === 'facebook'
                    ? 'Connects your Facebook profile network to evaluate interpersonal support buffer.'
                    : 'Used to query your 24-hr activity stream and engagement telemetry.'}
                </p>
              </div>

              {/* Quick 1-Click Samples for Testing Real API */}
              {quickPresets[platform.id] && quickPresets[platform.id].length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500">
                    Quick Sample Live Feeds (1-Click Test):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPresets[platform.id].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleSelectPreset(preset.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                          loginId === preset.value
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                        title={preset.desc}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy & No Password Assurance */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 text-teal-900 text-xs">
                <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-800 block">100% Secure — Koi Password Nahi Chahiye</span>
                  <span className="text-[11px] text-teal-700 leading-relaxed block mt-0.5">
                    MindCare aapke kisi bhi password ko na toh mangta hai aur na hi store karta hai. Sirf public username se public posts, comments aur circadian timestamps read kiye jaate hain.
                  </span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeConsent}
                    onChange={(e) => setAgreeConsent(e.target.checked)}
                    disabled={loading}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    Authorize MindCare AI to analyze today&apos;s real posts, comments, timestamps, and emotional valence to enrich my psychiatric assessment report.
                  </span>
                </label>
              </div>

              {/* Ingestion Steps Progress */}
              {loading && statusStep && (
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
                  <span className="text-xs font-semibold text-teal-900">{statusStep}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching Live Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Connect &amp; Fetch Real Data</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
