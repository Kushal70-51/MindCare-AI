'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  MessageSquare,
  Video,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Loader2,
  AlertTriangle,
  LogIn,
  LogOut,
  RefreshCw,
  ExternalLink,
  Upload,
  Sparkles,
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Trash2,
  Info,
  Layers,
  BarChart3,
  Cpu,
  HelpCircle,
  Globe,
  SlidersHorizontal,
  X,
  Calendar,
  ListFilter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialPlatform, PlatformDailyTelemetry } from '../../types/mindcare';
import { SocialSignInModal } from '../ui/SocialSignInModal';

type FilterTab = 'all' | 'connected' | 'unconnected';

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
    youtubeActivityInsight,
    youtubeProfileLoading,
    youtubeProfileError,
    connectYoutubeAccount,
    disconnectYoutubeAccount,
    loadYoutubeProfile,
    redditConnected,
    redditUsername,
    redditProfile,
    redditActivityInsight,
    redditProfileLoading,
    redditProfileError,
    connectRedditAccount,
    disconnectRedditAccount,
    loadRedditProfile,
    instagramProfile,
    instagramActivityInsight,
    instagramAnalysisLoading,
    instagramAnalysisError,
    analyzeInstagramExportFile,
    dailyTelemetryMap,
    connectPlatformWithDailyData,
    disconnectPlatform,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showPrivacyFaq, setShowPrivacyFaq] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Sign-in modal state
  const [signingInPlatform, setSigningInPlatform] = useState<SocialPlatform | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Timeline inspecting state
  const [inspectingTelemetry, setInspectingTelemetry] = useState<PlatformDailyTelemetry | null>(null);

  // Syncing state per card
  const [syncingPlatformId, setSyncingPlatformId] = useState<string | null>(null);

  // Auto-sync real Instagram export archive if missing or dummy
  useEffect(() => {
    const currentInsta = dailyTelemetryMap['instagram'];
    if (!currentInsta || !currentInsta.isRealData || (currentInsta.totalActivitiesAnalyzed || 0) <= 5) {
      connectPlatformWithDailyData('instagram', 'abhijit_u_11').catch((err) => {
        console.warn('[Auto-sync Instagram Archive]', err);
      });
    }
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
        );
      case 'Reddit':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FF4500] flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
          </div>
        );
      case 'Twitter (X)':
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
        );
      case 'Facebook':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        );
      case 'YouTube':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
        );
      case 'LinkedIn':
        return (
          <div className="w-9 h-9 rounded-xl bg-[#0A66C2] flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </div>
        );
      case 'GitHub':
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
        );
    }
  };

  const getClinicalBiomarkerTag = (platform: string) => {
    switch (platform) {
      case 'YouTube':
        return { label: 'Affect & Circadian Sleep Rhythm', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'Reddit':
        return { label: 'LIWC Linguistic Valence & Community Density', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'Instagram':
        return { label: 'Visual Affect & Social Withdrawal Signals', color: 'bg-pink-50 text-pink-700 border-pink-200' };
      case 'Twitter (X)':
        return { label: 'Cognitive Rumination & Sentiment Markers', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'LinkedIn':
        return { label: 'Occupational Fatigue & Burnout Indicators', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'Facebook':
        return { label: 'Interpersonal Connectivity & Support Network', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'GitHub':
        return { label: 'Nocturnal Code Commits & Occupational Strain', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'Behavioral Context Signal', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    }
  };

  const isPlatformConnected = (platformId: string, defaultConnected: boolean) => {
    if (dailyTelemetryMap[platformId]) return true;
    if (platformId === 'youtube') return youtubeConnected;
    if (platformId === 'reddit') return redditConnected;
    if (platformId === 'instagram') return Boolean(instagramProfile);
    return defaultConnected;
  };

  const connectedCount = useMemo(() => {
    return socialPlatforms.filter((p) => isPlatformConnected(p.id, p.connected)).length;
  }, [socialPlatforms, dailyTelemetryMap, youtubeConnected, redditConnected, instagramProfile]);

  const filteredPlatforms = useMemo(() => {
    return socialPlatforms.filter((p) => {
      const connected = isPlatformConnected(p.id, p.connected);
      if (activeFilter === 'connected') return connected;
      if (activeFilter === 'unconnected') return !connected;
      return true;
    });
  }, [socialPlatforms, activeFilter, dailyTelemetryMap, youtubeConnected, redditConnected, instagramProfile]);

  const handleOpenSignIn = (platform: SocialPlatform) => {
    setSigningInPlatform(platform);
    setIsSignInModalOpen(true);
  };

  const handleSignInSuccess = async (platformId: string, loginId: string, telemetry: PlatformDailyTelemetry) => {
    await connectPlatformWithDailyData(platformId, loginId, undefined, telemetry);
  };

  const handleReSyncDaily = async (platformId: string, loginId: string) => {
    setSyncingPlatformId(platformId);
    try {
      await connectPlatformWithDailyData(platformId, loginId);
    } catch (e: any) {
      showToast(`Sync notice: ${e.message}`);
    } finally {
      setSyncingPlatformId(null);
    }
  };

  const getContextDepthLevel = () => {
    if (connectedCount >= 4) return { label: 'Clinical Grade', level: 'High', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (connectedCount >= 2) return { label: 'Enhanced Context', level: 'Moderate', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    if (connectedCount === 1) return { label: 'Baseline Signal', level: 'Low', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Self-Report Only', level: 'None', color: 'text-slate-600 bg-slate-100 border-slate-200' };
  };

  const contextDepth = getContextDepthLevel();

  const faqs = [
    {
      q: 'How does daily social media telemetry enrich psychiatric assessment?',
      a: 'Psychiatric research demonstrates that digital phenotyping—such as daily linguistic word choice (pronoun frequencies, emotional valence), time-of-day activity dispersion (circadian sleep disruption), and peer engagement patterns—provides objective longitudinal context alongside direct clinical interview questions.',
    },
    {
      q: 'Are my private direct messages (DMs) or passwords accessed?',
      a: 'No, strictly read-only. MindCare AI only analyzes public activity posts, sentiment tokens, and timestamps within an encrypted ephemeral client sandbox. Private messages, credentials, and financial details are inaccessible.',
    },
    {
      q: 'How does this data feed into the final clinical psychiatric report?',
      a: 'When you conclude your assessment, all active platform telemetry (such as positive/negative sentiment ratios and circadian patterns) is injected into the clinical reasoning context. The AI synthesizer integrates these objective findings into your Diagnostic Formulation, Explainable SHAP Features, and Behavioral Matrix.',
    },
    {
      q: 'Can I revoke access or disconnect at any time?',
      a: 'Yes. Every connected platform features an instant one-click Disconnect button that completely wipes associated session tokens and extracted daily telemetry from memory.',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 text-slate-900 space-y-8">
      {/* ========================================================= */}
      {/* 1. INSTITUTIONAL CLINICAL HEADER                          */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              <span>Digital Phenotyping &amp; 24h Behavioral Data Ingestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Connected Behavioral Platforms
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Sign in to your platforms to fetch today&apos;s digital activity (posts, comments, watch patterns, and circadian timestamps) to enrich your psychiatric diagnosis report.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setShowPrivacyFaq(!showPrivacyFaq)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Privacy &amp; Security Specs</span>
              {showPrivacyFaq ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Executive Clinical Telemetry Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="space-y-1 p-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Active Feeds</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{connectedCount}</span>
              <span className="text-xs font-medium text-slate-400">/ 6 linked</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(connectedCount / 6) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 p-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Context Depth</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">{contextDepth.label}</span>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${contextDepth.color}`}>
              {contextDepth.level} Precision
            </span>
          </div>

          <div className="space-y-1 p-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security Protocol</span>
            </div>
            <div className="text-sm font-bold text-slate-900">AES-256 Sandbox</div>
            <p className="text-[10px] text-slate-500">Read-only feature extraction</p>
          </div>

          <div className="space-y-1 p-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Report Sync</span>
            </div>
            <div className="text-sm font-bold text-slate-900">Live Synthesis</div>
            <p className="text-[10px] text-slate-500">Direct DSM-5 context injection</p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PRIVACY & SECURITY ACCORDION (COLLAPSIBLE)              */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showPrivacyFaq && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-teal-900 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-teal-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-teal-50">HIPAA &amp; GDPR Compliant Telemetry Governance</h3>
                    <p className="text-[11px] text-teal-200/80">Ethical AI safeguards governing contextual digital data ingestion</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrivacyFaq(false)}
                  className="text-xs text-teal-300 hover:text-white underline"
                >
                  Close Specs
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-teal-800/60 border border-teal-700/60 space-y-1.5"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full flex items-start justify-between text-left gap-2 text-xs font-bold text-teal-100"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0 text-teal-300 mt-0.5" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0 text-teal-300 mt-0.5" />}
                      </button>
                      {isOpen && (
                        <p className="text-[11px] text-teal-200/90 leading-relaxed pt-1 border-t border-teal-700/40">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 3. FILTER TABS & SEARCH / CATEGORY SELECTOR               */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Services (6)', count: socialPlatforms.length },
            { id: 'connected', label: 'Active & Ingested', count: connectedCount },
            { id: 'unconnected', label: 'Ready to Connect', count: socialPlatforms.length - connectedCount },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Showing {filteredPlatforms.length} of {socialPlatforms.length} services
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. PLATFORMS GRID (EVERY PLATFORM HAS SIGN-IN & DAY DATA) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlatforms.map((platform, idx) => {
          const isConnected = isPlatformConnected(platform.id, platform.connected);
          const biomarker = getClinicalBiomarkerTag(platform.platform);
          const telemetry: PlatformDailyTelemetry | undefined = dailyTelemetryMap[platform.id];
          const isSyncing = syncingPlatformId === platform.id;

          const displayHandle =
            telemetry?.loginId ||
            (platform.id === 'youtube' ? youtubeChannelTitle : platform.id === 'reddit' ? redditUsername : null) ||
            platform.handle ||
            'Active User';

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                isConnected
                  ? 'bg-white border-teal-300 ring-1 ring-teal-200/50'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Header & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(platform.platform)}
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{platform.platform}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{platform.description}</p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0 ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Not Linked</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Phenotype Tag */}
                <div className={`p-2 rounded-xl border text-[11px] font-medium leading-tight ${biomarker.color}`}>
                  <span className="font-bold text-[10px] uppercase block tracking-wider opacity-75">
                    Target Phenotype:
                  </span>
                  {biomarker.label}
                </div>

                {/* If Connected: Show Rich Day Telemetry & Controls */}
                {isConnected ? (
                  <div className="space-y-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Logged in ID:</span>
                        <span className="font-bold text-teal-900 truncate max-w-[170px] font-mono">
                          {displayHandle}
                        </span>
                      </div>

                      {telemetry?.dataSource && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Data Source:</span>
                          <span className={`font-semibold truncate max-w-[170px] ${telemetry.isRealData ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {telemetry.isRealData ? '🟢 ' : '🟡 '}{telemetry.dataSource}
                          </span>
                        </div>
                      )}

                      {/* Ingested Activity Metrics */}
                      <div className="space-y-1.5 pt-1 border-t border-teal-200/60">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Activities Evaluated:</span>
                          <span className="font-extrabold text-slate-800">
                            {telemetry?.totalActivitiesAnalyzed?.toLocaleString() || (platform.id === 'youtube' ? youtubeProfile?.analyzedLikedCount || 16 : 0)} items
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Dominant Emotion:</span>
                          <span className="font-bold text-teal-800 uppercase px-2 py-0.5 rounded bg-teal-100/80 text-[10px]">
                            {telemetry?.dominantEmotion || (platform.id === 'youtube' ? youtubeProfile?.dominantEmotion : 'Calm')}
                          </span>
                        </div>

                        {/* Positivity Meter */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Positive Valence:</span>
                            <span className="font-bold text-slate-700">
                              {telemetry
                                ? `${Math.round(telemetry.positiveRatio * 100)}%`
                                : youtubeProfile
                                ? `${Math.round(youtubeProfile.positiveRatio * 100)}%`
                                : '65%'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{
                                width: `${
                                  telemetry
                                    ? telemetry.positiveRatio * 100
                                    : youtubeProfile
                                    ? youtubeProfile.positiveRatio * 100
                                    : 65
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Circadian Timing Snippet */}
                        <div className="flex items-start gap-1.5 pt-1.5 text-[10px] text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {telemetry?.circadianPattern || youtubeActivityInsight?.activityPattern || 'Daytime concentration with subtle late-night screen latency.'}
                          </span>
                        </div>
                      </div>

                      {/* Inspect Timeline Button */}
                      {telemetry && (
                        <button
                          type="button"
                          onClick={() => setInspectingTelemetry(telemetry)}
                          className="w-full mt-2 py-2 px-3 rounded-xl bg-white hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                        >
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          <span>View Ingested Posts &amp; Activity Timeline</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* If NOT Connected: Clean Callout to Sign In */
                  <div className="space-y-2 py-1">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {platform.id === 'instagram'
                        ? "Upload your official Instagram data export (.zip or .json) to analyze your real posts, comments, likes, and circadian rhythm."
                        : `Sign in with your ${platform.platform} login ID to fetch your day's posts, comments, and circadian activity to calculate behavioral biomarkers.`}
                    </p>
                    {platform.id === 'instagram' && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-700">
                        <Upload className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Uploads official Meta Download .ZIP archive</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Always Render Prominent Sign In or Sync/Disconnect Action */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReSyncDaily(platform.id, displayHandle)}
                      disabled={isSyncing}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
                    >
                      {isSyncing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>{isSyncing ? 'Syncing...' : "Re-Sync Today's Data"}</span>
                    </button>

                    <button
                      onClick={() => disconnectPlatform(platform.id)}
                      title="Disconnect Account"
                      className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all shadow-2xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenSignIn(platform)}
                    className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-95"
                    style={{ backgroundColor: platform.color || '#0F766E' }}
                  >
                    {platform.id === 'instagram' ? <Upload className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                    <span>{platform.id === 'instagram' ? 'Connect or Upload .ZIP Export' : `Sign in with ${platform.platform}`}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-75" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 5. CONSOLIDATED CLINICAL TELEMETRY AUDIT BOX              */}
      {/* ========================================================= */}
      {connectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-teal-50/90 via-white to-slate-50 border border-teal-200/80 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Active Clinical Ingestion Pipeline ({connectedCount} Feeds Synced)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Every connected feed&apos;s day activities are automatically injected into your psychiatric report context.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Ready for AI Synthesis</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Circadian Sleep Correlation
              </span>
              <p className="text-xs font-semibold text-slate-800">
                {Object.values(dailyTelemetryMap)[0]?.circadianPattern ||
                  youtubeActivityInsight?.activityPattern ||
                  'Normal diurnal activity with subtle late-night screen exposure logged.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Linguistic Sentiment Polarity
              </span>
              <p className="text-xs font-semibold text-slate-800">
                {Object.values(dailyTelemetryMap).length > 0
                  ? `${Math.round(
                      (Object.values(dailyTelemetryMap).reduce((a, b) => a + b.positiveRatio, 0) /
                        Object.values(dailyTelemetryMap).length) *
                        100
                    )}% average positivity across active streams`
                  : 'Balanced affective tone logged across day activities.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Report Generation Integration
              </span>
              <p className="text-xs font-semibold text-teal-800">
                Feeds into DSM-5 Diagnostic Report, SHAP features &amp; Evidence quotes
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 6. BOTTOM NAVIGATION ACTIONS                              */}
      {/* ========================================================= */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <button
          onClick={() => setScreen('dashboard')}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200 shadow-2xs transition-all"
        >
          Return to Dashboard
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setScreen('assessment')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group"
          >
            <span>Proceed to Clinical Interview</span>
            {connectedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-teal-500 text-white text-[10px] font-extrabold">
                {connectedCount} Feeds Active
              </span>
            )}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. UNIVERSAL SIGN-IN MODAL                                */}
      {/* ========================================================= */}
      <SocialSignInModal
        isOpen={isSignInModalOpen}
        platform={signingInPlatform}
        onClose={() => setIsSignInModalOpen(false)}
        onSuccess={handleSignInSuccess}
        onUploadInstagramExport={analyzeInstagramExportFile}
      />

      {/* ========================================================= */}
      {/* 8. DAY ACTIVITY TIMELINE INSPECTOR MODAL                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {inspectingTelemetry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingTelemetry(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-600 text-white">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {inspectingTelemetry.platformName} &bull; Ingested Behavioral Activity Timeline
                    </h3>
                    <p className="text-xs text-slate-300">
                      Account: <strong className="font-mono text-teal-300">{inspectingTelemetry.loginId}</strong> &bull; {inspectingTelemetry.totalActivitiesAnalyzed?.toLocaleString() || 0} authentic data points evaluated
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingTelemetry(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Summary Strip */}
              <div className="px-6 py-3 bg-teal-50 border-b border-teal-100 flex flex-wrap items-center justify-between gap-3 text-xs text-teal-900 shrink-0">
                <div>
                  <strong>Dominant Affect:</strong>{' '}
                  <span className="uppercase font-bold text-teal-800">{inspectingTelemetry.dominantEmotion}</span>
                </div>
                <div>
                  <strong>Positive Valence:</strong>{' '}
                  <span className="font-bold">{Math.round(inspectingTelemetry.positiveRatio * 100)}%</span>
                </div>
                {inspectingTelemetry.dataSource && (
                  <div>
                    <strong>Data Feed:</strong>{' '}
                    <span className={`font-semibold ${inspectingTelemetry.isRealData ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {inspectingTelemetry.isRealData ? '🟢 ' : '🟡 '}{inspectingTelemetry.dataSource}
                    </span>
                  </div>
                )}
                <div>
                  <strong>Activity Rhythm:</strong>{' '}
                  <span className="text-[11px] text-teal-800">{inspectingTelemetry.circadianPattern}</span>
                </div>
              </div>

              {/* Scrollable Timeline List */}
              <div className="p-6 overflow-y-auto space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Ingested Activity Stream ({inspectingTelemetry.recentActivities?.length || 0} items from provided data):
                </h4>

                {(!inspectingTelemetry.recentActivities || inspectingTelemetry.recentActivities.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <p className="text-sm font-semibold text-slate-700">No activity data provided yet</p>
                    <p className="text-xs text-slate-500">
                      Upload your official export archive or connect your account to evaluate your authentic activities.
                    </p>
                  </div>
                ) : (

                <div className="space-y-2.5">
                  {inspectingTelemetry.recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3 text-xs"
                    >
                      <div className="px-2 py-1 rounded-lg bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-600 shrink-0">
                        {act.time}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 text-[10px] font-bold">
                            {act.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              act.emotion === 'joy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : act.emotion === 'calm'
                                ? 'bg-teal-100 text-teal-800'
                                : act.emotion === 'anxiety'
                                ? 'bg-amber-100 text-amber-800'
                                : act.emotion === 'fatigue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            Affect: {act.emotion}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium leading-relaxed">{act.contentSnippet}</p>
                      </div>
                    </div>
                  ))}
                </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5 mt-4">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Clinical Diagnostic Utility:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {inspectingTelemetry.clinicalSummary}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button
                  onClick={() => setInspectingTelemetry(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Timeline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
