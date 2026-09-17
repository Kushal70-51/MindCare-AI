'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AssessmentAnswer,
  FacialEmotionSample,
  InterviewMessage,
  MentalHealthReport,
  PrivacyConsentState,
  ReportHistoryEntry,
  RetrievedEvidenceItem,
  ScreenId,
  SocialPlatform,
  UserProfile,
  VoiceEmotionSample,
} from '../types/mindcare';
import { FaceEmotionReading } from '../hooks/useFaceEmotion';
import { classifyTextEmotion, isNegativeEmotion, mapEmotionToSentiment } from '../utils/speechEmotion';
import { VoiceEmotionResult, isNegativeVoiceEmotion } from '../utils/voiceEmotion';
import { detectCrisisLanguage } from '../utils/crisisDetection';
import {
  analyzeYoutubeVideo,
  checkYoutubeConnection,
  disconnectYoutubeAccount as disconnectYoutubeAccountUtil,
  fetchYoutubeProfileInsight,
  generateYoutubeActivityInsight,
  SocialInsight,
  YoutubeActivityInsight,
  YoutubeProfileInsight,
  checkRedditConnection,
  disconnectRedditAccount as disconnectRedditAccountUtil,
  fetchRedditProfileInsight,
  generateRedditActivityInsight,
  RedditActivityInsight,
  RedditProfileInsight,
  analyzeInstagramExport,
  InstagramActivityInsight,
  InstagramProfileInsight,
} from '../utils/socialAnalysis';
import { PHQ9_SELF_HARM_ITEM_ID, PHQ9_SLEEP_ITEM_ID, isScreenerComplete, scoreGAD7, scorePHQ9 } from '../utils/screeners';
import {
  buildInterviewOpener,
  DEFAULT_SOCIAL_PLATFORMS,
  INITIAL_REPORT,
  INITIAL_USER,
} from '../utils/mockData';

const HISTORY_STORAGE_KEY = 'mindcare_report_history';
const SHARED_DOCTOR_STORAGE_KEY = 'mindcare_shared_doctor';

interface AppContextType {
  screen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  user: UserProfile;
  setUser: (user: Partial<UserProfile>) => void;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
  consent: PrivacyConsentState;
  updateConsent: (consent: Partial<PrivacyConsentState>) => void;
  socialPlatforms: SocialPlatform[];
  toggleSocialPlatform: (id: string) => void;
  updateSocialHandle: (id: string, handle: string) => void;
  socialInsight: SocialInsight | null;
  socialAnalysisLoading: boolean;
  socialAnalysisError: string | null;
  analyzeYoutubeVideoUrl: (url: string) => Promise<void>;
  youtubeConnected: boolean;
  youtubeChannelTitle: string | null;
  youtubeProfile: YoutubeProfileInsight | null;
  youtubeActivityInsight: YoutubeActivityInsight | null;
  youtubeProfileLoading: boolean;
  youtubeProfileError: string | null;
  connectYoutubeAccount: () => void;
  disconnectYoutubeAccount: () => Promise<void>;
  loadYoutubeProfile: () => Promise<void>;
  redditConnected: boolean;
  redditUsername: string | null;
  redditProfile: RedditProfileInsight | null;
  redditActivityInsight: RedditActivityInsight | null;
  redditProfileLoading: boolean;
  redditProfileError: string | null;
  connectRedditAccount: () => void;
  disconnectRedditAccount: () => Promise<void>;
  loadRedditProfile: () => Promise<void>;
  instagramProfile: InstagramProfileInsight | null;
  instagramActivityInsight: InstagramActivityInsight | null;
  instagramAnalysisLoading: boolean;
  instagramAnalysisError: string | null;
  analyzeInstagramExportFile: (file: File) => Promise<void>;
  currentAiQuestion: string;
  interviewTurnNumber: number;
  interviewLoading: boolean;
  interviewComplete: boolean;
  startInterview: (lang?: string) => void;
  answers: AssessmentAnswer[];
  recordAnswer: (answerText: string, language?: string) => void;
  resetAssessment: () => void;
  report: MentalHealthReport;
  faceEmotionSamples: FacialEmotionSample[];
  currentFaceEmotion: FacialEmotionSample | null;
  recordFaceEmotion: (reading: FaceEmotionReading) => void;
  voiceEmotionSamples: VoiceEmotionSample[];
  recordVoiceEmotion: (result: VoiceEmotionResult, questionId: number) => void;
  screenerResponses: Record<string, number>;
  answerScreenerQuestion: (questionId: string, value: number) => void;
  screenerComplete: boolean;
  crisisFlag: boolean;
  dismissCrisisFlag: () => void;
  reportHistory: ReportHistoryEntry[];
  sharedDoctor: { reportId: string; doctorName: string } | null;
  setSharedDoctor: (value: { reportId: string; doctorName: string } | null) => void;
  cameraOn: boolean;
  setCameraOn: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCamera: () => void;
  micMuted: boolean;
  setMicMuted: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMic: () => void;
  backgroundBlur: boolean;
  toggleBackgroundBlur: () => void;
  theme: 'light' | 'dark' | 'calm';
  setTheme: (theme: 'light' | 'dark' | 'calm') => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  largeFont: boolean;
  toggleLargeFont: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function scoreToSeverity(score: number): 'Optimal' | 'Mild' | 'Moderate' | 'Severe' {
  if (score < 25) return 'Optimal';
  if (score < 50) return 'Mild';
  if (score < 75) return 'Moderate';
  return 'Severe';
}

// Descriptions for when a condition's score/severity is driven purely by a
// live multimodal signal (no screener completed) — generated fresh each time
// from the actual computed severity, instead of leaving the static mock
// description in place, which previously produced contradictions like
// "Severe (100/100)" paired with a description praising "healthy affect".
function describeFacialCondition(severity: 'Optimal' | 'Mild' | 'Moderate' | 'Severe'): string {
  switch (severity) {
    case 'Optimal':
      return 'Live facial-expression analysis shows predominantly positive affect across the session, with no significant markers of depressive mood detected.';
    case 'Mild':
      return 'Live facial-expression analysis shows occasional flat or low-energy expressions — a mild signal worth keeping an eye on.';
    case 'Moderate':
      return 'Live facial-expression analysis shows a moderate share of low-energy or negative affect across the session, a signal worth monitoring.';
    default:
      return 'Live facial-expression analysis shows a high proportion of negative affect (sadness, low energy) across the session — a strong signal worth clinical follow-up.';
  }
}

function describeLinguisticCondition(severity: 'Optimal' | 'Mild' | 'Moderate' | 'Severe'): string {
  switch (severity) {
    case 'Optimal':
      return 'Linguistic tone across responses was constructive and calm, with no significant markers of anxious language detected.';
    case 'Mild':
      return 'Linguistic tone across responses showed occasional tension or worry-language — a mild signal worth keeping an eye on.';
    case 'Moderate':
      return 'Linguistic tone across responses showed a moderate share of anxious or tense language, a signal worth monitoring.';
    default:
      return 'Linguistic tone across responses showed a high share of anxious or tense language — a strong signal worth clinical follow-up.';
  }
}

function describeSleepCondition(severity: 'Optimal' | 'Mild' | 'Moderate' | 'Severe', rawValue: number): string {
  const freq = ['not at all', 'on several days', 'on more than half the days', 'nearly every day'][rawValue] || 'occasionally';
  if (severity === 'Optimal') return `Self-reported PHQ-9 sleep item: trouble sleeping ${freq} — no significant sleep disruption reported.`;
  return `Self-reported PHQ-9 sleep item: trouble falling/staying asleep (or oversleeping) ${freq} — a real, self-reported signal, not a full PSQI instrument.`;
}

// Higher score = better outcome here (unlike the other conditions), since
// this tracks protective/constructive language rather than symptom
// frequency — thresholds are inverted from scoreToSeverity accordingly.
function scoreToSeverityInverse(score: number): 'Optimal' | 'Mild' | 'Moderate' | 'Severe' {
  if (score >= 75) return 'Optimal';
  if (score >= 50) return 'Mild';
  if (score >= 25) return 'Moderate';
  return 'Severe';
}

function describeResilienceCondition(severity: 'Optimal' | 'Mild' | 'Moderate' | 'Severe'): string {
  switch (severity) {
    case 'Optimal':
      return 'Live linguistic analysis shows frequent constructive, hopeful language across responses — a strong protective signal.';
    case 'Mild':
      return 'Live linguistic analysis shows a reasonable share of constructive language across responses — a moderate coping signal.';
    case 'Moderate':
      return 'Live linguistic analysis shows limited constructive or hopeful language across responses — worth encouraging active coping strategies.';
    default:
      return 'Live linguistic analysis shows little constructive or hopeful language across responses — worth addressing with active coping strategies.';
  }
}

// Headline status line — previously left as static mock text regardless of
// what the computed conditions/risk actually said (e.g. could show "Mild
// Stress & Sleep Irregularity" even when the real session showed severe
// depression and no sleep signal at all). Derived fresh from the real
// riskLevel + condition severities every time instead.
function deriveOverallStatus(
  riskLevel: MentalHealthReport['riskLevel'],
  conditions: MentalHealthReport['conditions']
): string {
  if (riskLevel === 'High') return 'Elevated Distress — Clinical Follow-Up Recommended';
  if (riskLevel === 'Moderate') return 'Moderate Stress Indicators Present';

  const concerning = conditions.filter(
    (c) => c.name !== 'Resilience & Coping Capacity' && c.severity !== 'Optimal'
  );
  if (concerning.length === 0) return 'Stable & Well-Regulated Mood';

  const names = concerning
    .map((c) => c.name.replace(/ Index| Marker| \(PSQI\)/g, '').trim())
    .join(' & ');
  return `Mild ${names} Signal${concerning.length > 1 ? 's' : ''}, Otherwise Stable`;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<ScreenId>('splash');
  const [user, setUserState] = useState<UserProfile>(INITIAL_USER);
  const [consent, setConsent] = useState<PrivacyConsentState>({
    privacyPolicy: true,
    aiAssessment: true,
    nonMedicalDisclaimer: true,
    socialMediaData: false,
  });
  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>(DEFAULT_SOCIAL_PLATFORMS);
  const [socialInsight, setSocialInsight] = useState<SocialInsight | null>(null);
  const [socialAnalysisLoading, setSocialAnalysisLoading] = useState(false);
  const [socialAnalysisError, setSocialAnalysisError] = useState<string | null>(null);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeChannelTitle, setYoutubeChannelTitle] = useState<string | null>(null);
  const [youtubeProfile, setYoutubeProfile] = useState<YoutubeProfileInsight | null>(null);
  const [youtubeActivityInsight, setYoutubeActivityInsight] = useState<YoutubeActivityInsight | null>(null);
  const [youtubeProfileLoading, setYoutubeProfileLoading] = useState(false);
  const [youtubeProfileError, setYoutubeProfileError] = useState<string | null>(null);
  const [redditConnected, setRedditConnected] = useState(false);
  const [redditUsername, setRedditUsername] = useState<string | null>(null);
  const [redditProfile, setRedditProfile] = useState<RedditProfileInsight | null>(null);
  const [redditActivityInsight, setRedditActivityInsight] = useState<RedditActivityInsight | null>(null);
  const [redditProfileLoading, setRedditProfileLoading] = useState(false);
  const [redditProfileError, setRedditProfileError] = useState<string | null>(null);
  const [instagramProfile, setInstagramProfile] = useState<InstagramProfileInsight | null>(null);
  const [instagramActivityInsight, setInstagramActivityInsight] = useState<InstagramActivityInsight | null>(null);
  const [instagramAnalysisLoading, setInstagramAnalysisLoading] = useState(false);
  const [instagramAnalysisError, setInstagramAnalysisError] = useState<string | null>(null);
  const [interviewMessages, setInterviewMessages] = useState<InterviewMessage[]>([]);
  const interviewMessagesRef = React.useRef<InterviewMessage[]>([]);
  const [currentAiQuestion, setCurrentAiQuestion] = useState<string>('');
  const [interviewTurnNumber, setInterviewTurnNumber] = useState<number>(0);
  const [interviewLoading, setInterviewLoading] = useState<boolean>(false);
  const [interviewComplete, setInterviewComplete] = useState<boolean>(false);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [report, setReport] = useState<MentalHealthReport>(INITIAL_REPORT);
  const [faceEmotionSamples, setFaceEmotionSamples] = useState<FacialEmotionSample[]>([]);
  const [voiceEmotionSamples, setVoiceEmotionSamples] = useState<VoiceEmotionSample[]>([]);
  const [screenerResponses, setScreenerResponses] = useState<Record<string, number>>({});
  const [crisisFlag, setCrisisFlag] = useState(false);
  const [crisisEverFlagged, setCrisisEverFlagged] = useState(false);
  const [reportHistory, setReportHistory] = useState<ReportHistoryEntry[]>([]);
  const [sharedDoctor, setSharedDoctorState] = useState<{ reportId: string; doctorName: string } | null>(null);
  const historySavedRef = React.useRef(false);
  const socialAutoFetchedRef = React.useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) setReportHistory(JSON.parse(stored));
    } catch (e) {
      console.warn('Could not load report history from localStorage:', e);
    }
    try {
      const storedDoctor = window.localStorage.getItem(SHARED_DOCTOR_STORAGE_KEY);
      if (storedDoctor) setSharedDoctorState(JSON.parse(storedDoctor));
    } catch (e) {
      console.warn('Could not load shared-doctor state from localStorage:', e);
    }
    // Restores YouTube sign-in state after a page load/reload — the actual
    // session lives in the httpOnly OAuth cookies set by the callback route,
    // this just reflects that into UI state.
    checkYoutubeConnection().then((status) => {
      if (status.connected) {
        setYoutubeConnected(true);
        setYoutubeChannelTitle(status.channelTitle || null);
      }
    });
    checkRedditConnection().then((status) => {
      if (status.connected) {
        setRedditConnected(true);
        setRedditUsername(status.username || null);
      }
    });

    // The OAuth callback does a full-page redirect back to
    // `/?youtube_auth=...` or `/?reddit_auth=...` (required by the
    // authorization-code flow) — pick that up, drop the user back on the
    // Connected Platforms screen, and scrub the query param.
    const params = new URLSearchParams(window.location.search);
    const youtubeAuthResult = params.get('youtube_auth');
    const redditAuthResult = params.get('reddit_auth');
    if (youtubeAuthResult || redditAuthResult) {
      setScreen('social');
      if (youtubeAuthResult) {
        showToast(
          youtubeAuthResult === 'denied'
            ? 'YouTube sign-in was cancelled.'
            : youtubeAuthResult === 'error'
            ? 'YouTube sign-in failed. Please try again.'
            : 'YouTube account connected!'
        );
      } else if (redditAuthResult) {
        showToast(
          redditAuthResult === 'denied'
            ? 'Reddit sign-in was cancelled.'
            : redditAuthResult === 'error'
            ? 'Reddit sign-in failed. Please try again.'
            : 'Reddit account connected!'
        );
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Persisted so the patient's chat/video-call widget survives a page
  // refresh — it previously lived in plain React state and vanished on
  // reload even though the underlying shared-report thread was still there.
  const setSharedDoctor = (value: { reportId: string; doctorName: string } | null) => {
    setSharedDoctorState(value);
    try {
      if (value) {
        window.localStorage.setItem(SHARED_DOCTOR_STORAGE_KEY, JSON.stringify(value));
      } else {
        window.localStorage.removeItem(SHARED_DOCTOR_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Could not persist shared-doctor state:', e);
    }
  };

  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [backgroundBlur, setBackgroundBlur] = useState<boolean>(true);

  const [theme, setThemeState] = useState<'light' | 'dark' | 'calm'>('calm');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [largeFont, setLargeFont] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const setUser = (updated: Partial<UserProfile>) => {
    setUserState((prev) => ({ ...prev, ...updated }));
  };

  const loginUser = (email: string, name?: string) => {
    setUserState((prev) => ({
      ...prev,
      email,
      fullName: name || email.split('@')[0].replace('.', ' '),
      isLoggedIn: true,
    }));
    showToast(`Welcome back, ${name || email.split('@')[0]}!`);
  };

  const logoutUser = () => {
    setUserState((prev) => ({ ...prev, isLoggedIn: false }));
    setScreen('welcome');
    showToast('Logged out successfully.');
  };

  const updateConsent = (updated: Partial<PrivacyConsentState>) => {
    setConsent((prev) => ({ ...prev, ...updated }));
  };

  const toggleSocialPlatform = (id: string) => {
    setSocialPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p))
    );
  };

  const updateSocialHandle = (id: string, handle: string) => {
    setSocialPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, handle } : p))
    );
  };

  // Real social-context signal: fetches a YouTube video's public comments and
  // classifies each with the same in-browser emotion model used on interview
  // answers (see utils/socialAnalysis.ts), then folds the aggregate into the
  // report as a genuine "Social Context" SHAP feature + evidence quote —
  // replacing the static mock Reddit-activity placeholder.
  const analyzeYoutubeVideoUrl = async (url: string) => {
    setSocialAnalysisLoading(true);
    setSocialAnalysisError(null);
    try {
      const insight = await analyzeYoutubeVideo(url);
      setSocialInsight(insight);

      setSocialPlatforms((prev) =>
        prev.map((p) => (p.id === 'youtube' ? { ...p, connected: true, handle: url } : p))
      );

      const netNegativity = insight.negativeRatio - insight.positiveRatio;
      setReport((prev) => ({
        ...prev,
        shapFeatures: [
          {
            feature: 'YouTube Comment Sentiment (DistilRoBERTa)',
            category: 'Social Context',
            impactValue: Number(netNegativity.toFixed(2)),
            formattedValue: `${(insight.positiveRatio * 100).toFixed(0)}% positive / ${(insight.negativeRatio * 100).toFixed(0)}% negative tone`,
            explanation: `Classified ${insight.analyzedCount} public comments from "${insight.videoTitle}" using the same pretrained emotion model as spoken responses; dominant tone "${insight.dominantEmotion}".`,
          },
          ...prev.shapFeatures.filter((f) => f.feature !== 'YouTube Comment Sentiment (DistilRoBERTa)'),
        ],
        retrievedEvidence: [
          {
            id: 'ev_social_live',
            source: 'Social Data Feed',
            quote: `YouTube comment analysis on "${insight.videoTitle}" (${insight.channelTitle}): dominant tone "${insight.dominantEmotion}" across ${insight.analyzedCount} comments.`,
            sentiment: netNegativity > 0 ? 'Mild Distress' : 'Calm',
            timestamp: 'YouTube Integration',
          },
          ...prev.retrievedEvidence.filter((e) => e.id !== 'ev_social_live'),
        ],
      }));
    } catch (err) {
      setSocialAnalysisError(err instanceof Error ? err.message : 'Could not analyze that video.');
    } finally {
      setSocialAnalysisLoading(false);
    }
  };

  // Hands off to Google's real OAuth consent screen (app/api/auth/youtube/login)
  // — a full page redirect is required for the OAuth authorization-code flow,
  // it can't happen inside a fetch/XHR.
  const connectYoutubeAccount = () => {
    window.location.href = '/api/auth/youtube/login';
  };

  const disconnectYoutubeAccount = async () => {
    await disconnectYoutubeAccountUtil();
    setYoutubeConnected(false);
    setYoutubeChannelTitle(null);
    setYoutubeProfile(null);
  };

  // Real signed-in-user signal: subscriptions (interest/topic profile) +
  // liked videos (positive-engagement content), classified with the same
  // in-browser emotion model as everything else — folded into the report as
  // a second, independent "Social Context" feature alongside the public
  // comment-sentiment one (see analyzeYoutubeVideoUrl above).
  const loadYoutubeProfile = async () => {
    setYoutubeProfileLoading(true);
    setYoutubeProfileError(null);
    try {
      const profile = await fetchYoutubeProfileInsight();
      setYoutubeProfile(profile);
      setYoutubeChannelTitle(profile.channelTitle);

      const netNegativity = profile.negativeRatio - profile.positiveRatio;
      const topInterests = profile.subscriptions.slice(0, 5).map((s) => s.title).join(', ');

      // Real timestamps (when the user subscribed/liked, not video upload
      // dates) turned into an actual time-of-day distribution, then narrated
      // by an LLM into a written activity-timing + possible-lifestyle-impact
      // note — this is what actually answers "when is the user active" and
      // "does this relate to sleep", not just an emotion percentage.
      let activityInsight: YoutubeActivityInsight | null = null;
      try {
        activityInsight = await generateYoutubeActivityInsight(profile);
        setYoutubeActivityInsight(activityInsight);
      } catch (err) {
        console.warn('YouTube activity-timing insight failed:', err);
      }

      setReport((prev) => ({
        ...prev,
        shapFeatures: [
          {
            feature: 'YouTube Activity Profile (Subscriptions & Liked Videos)',
            category: 'Social Context',
            impactValue: Number(netNegativity.toFixed(2)),
            formattedValue: `${profile.subscriptions.length} subscriptions, ${profile.analyzedLikedCount} liked videos analyzed`,
            explanation:
              activityInsight?.summary ||
              `Signed-in YouTube account: follows ${topInterests || 'a small set of channels'}. Liked-video titles classified with the same pretrained emotion model as spoken responses; dominant tone "${profile.dominantEmotion}".`,
          },
          ...prev.shapFeatures.filter((f) => f.feature !== 'YouTube Activity Profile (Subscriptions & Liked Videos)'),
        ],
        retrievedEvidence: [
          {
            id: 'ev_social_profile_live',
            source: 'Social Data Feed',
            quote: `YouTube account activity: subscribed to ${profile.subscriptions.length} channels (e.g. ${topInterests || 'none listed'}); liked-video sentiment dominant tone "${profile.dominantEmotion}".`,
            sentiment: netNegativity > 0 ? 'Mild Distress' : 'Calm',
            timestamp: 'YouTube Account Integration',
          },
          ...(activityInsight
            ? [
                {
                  id: 'ev_social_activity_timing',
                  source: 'Social Data Feed' as const,
                  quote: [activityInsight.activityPattern, activityInsight.lifestyleSignal]
                    .filter(Boolean)
                    .join(' '),
                  sentiment: 'Neutral',
                  timestamp: 'YouTube Activity Timing Analysis',
                },
              ]
            : []),
          ...prev.retrievedEvidence.filter(
            (e) => e.id !== 'ev_social_profile_live' && e.id !== 'ev_social_activity_timing'
          ),
        ],
      }));
    } catch (err) {
      setYoutubeProfileError(err instanceof Error ? err.message : 'Could not read your YouTube activity.');
    } finally {
      setYoutubeProfileLoading(false);
    }
  };

  const connectRedditAccount = () => {
    window.location.href = '/api/auth/reddit/login';
  };

  const disconnectRedditAccount = async () => {
    await disconnectRedditAccountUtil();
    setRedditConnected(false);
    setRedditUsername(null);
    setRedditProfile(null);
  };

  // Mirrors loadYoutubeProfile above: subscribed subreddits (interest
  // profile) + recent comments (real text, classified with the same
  // in-browser model), both with genuine created_utc activity timestamps
  // narrated by an LLM into an activity-timing + lifestyle signal — folded
  // into the report as its own "Social Context" feature alongside YouTube's.
  const loadRedditProfile = async () => {
    setRedditProfileLoading(true);
    setRedditProfileError(null);
    try {
      const profile = await fetchRedditProfileInsight();
      setRedditProfile(profile);
      setRedditUsername(profile.username);

      const netNegativity = profile.negativeRatio - profile.positiveRatio;
      const topInterests = profile.subscribedSubreddits.slice(0, 5).map((s) => s.name).join(', ');

      let activityInsight: RedditActivityInsight | null = null;
      try {
        activityInsight = await generateRedditActivityInsight(profile);
        setRedditActivityInsight(activityInsight);
      } catch (err) {
        console.warn('Reddit activity-timing insight failed:', err);
      }

      setReport((prev) => ({
        ...prev,
        shapFeatures: [
          {
            feature: 'Reddit Activity Profile (Subreddits & Comments)',
            category: 'Social Context',
            impactValue: Number(netNegativity.toFixed(2)),
            formattedValue: `${profile.subscribedSubreddits.length} subreddits, ${profile.analyzedCommentCount} comments analyzed`,
            explanation:
              activityInsight?.summary ||
              `Signed-in Reddit account: follows ${topInterests || 'a small set of communities'}. Recent comments classified with the same pretrained emotion model as spoken responses; dominant tone "${profile.dominantEmotion}".`,
          },
          ...prev.shapFeatures.filter((f) => f.feature !== 'Reddit Activity Profile (Subreddits & Comments)'),
        ],
        retrievedEvidence: [
          {
            id: 'ev_reddit_profile_live',
            source: 'Social Data Feed',
            quote: `Reddit account activity: subscribed to ${profile.subscribedSubreddits.length} communities (e.g. ${topInterests || 'none listed'}); recent comment sentiment dominant tone "${profile.dominantEmotion}".`,
            sentiment: netNegativity > 0 ? 'Mild Distress' : 'Calm',
            timestamp: 'Reddit Account Integration',
          },
          ...(activityInsight
            ? [
                {
                  id: 'ev_reddit_activity_timing',
                  source: 'Social Data Feed' as const,
                  quote: [activityInsight.activityPattern, activityInsight.lifestyleSignal]
                    .filter(Boolean)
                    .join(' '),
                  sentiment: 'Neutral',
                  timestamp: 'Reddit Activity Timing Analysis',
                },
              ]
            : []),
          ...prev.retrievedEvidence.filter(
            (e) => e.id !== 'ev_reddit_profile_live' && e.id !== 'ev_reddit_activity_timing'
          ),
        ],
      }));
    } catch (err) {
      setRedditProfileError(err instanceof Error ? err.message : 'Could not read your Reddit activity.');
    } finally {
      setRedditProfileLoading(false);
    }
  };

  // Instagram has no individual-developer OAuth path (see utils/socialAnalysis.ts
  // for why), so this is a one-time, user-triggered upload of their own
  // official data export rather than a persistent connection — no auto-fetch
  // on assessment completion, the person re-uploads whenever they want a
  // refresh. Otherwise identical pipeline: classify + narrate + merge into report.
  const analyzeInstagramExportFile = async (file: File) => {
    setInstagramAnalysisLoading(true);
    setInstagramAnalysisError(null);
    try {
      const { profile, activity } = await analyzeInstagramExport(file);
      setInstagramProfile(profile);
      setInstagramActivityInsight(activity);

      const netNegativity = profile.negativeRatio - profile.positiveRatio;

      setReport((prev) => ({
        ...prev,
        shapFeatures: [
          {
            feature: 'Instagram Activity Profile (Data Export)',
            category: 'Social Context',
            impactValue: Number(netNegativity.toFixed(2)),
            formattedValue: `${profile.analyzedCount} posts/comments analyzed from export`,
            explanation:
              activity.summary ||
              `Own official Instagram data export: ${profile.analyzedCount} entries classified with the same pretrained emotion model as spoken responses; dominant tone "${profile.dominantEmotion}".`,
          },
          ...prev.shapFeatures.filter((f) => f.feature !== 'Instagram Activity Profile (Data Export)'),
        ],
        retrievedEvidence: [
          {
            id: 'ev_instagram_profile_live',
            source: 'Social Data Feed',
            quote: `Instagram data export: ${profile.analyzedCount} posts/comments analyzed, dominant tone "${profile.dominantEmotion}".`,
            sentiment: netNegativity > 0 ? 'Mild Distress' : 'Calm',
            timestamp: 'Instagram Data Export',
          },
          ...(activity
            ? [
                {
                  id: 'ev_instagram_activity_timing',
                  source: 'Social Data Feed' as const,
                  quote: [activity.activityPattern, activity.lifestyleSignal].filter(Boolean).join(' '),
                  sentiment: 'Neutral',
                  timestamp: 'Instagram Activity Timing Analysis',
                },
              ]
            : []),
          ...prev.retrievedEvidence.filter(
            (e) => e.id !== 'ev_instagram_profile_live' && e.id !== 'ev_instagram_activity_timing'
          ),
        ],
      }));
    } catch (err) {
      setInstagramAnalysisError(err instanceof Error ? err.message : 'Could not analyze that export file.');
    } finally {
      setInstagramAnalysisLoading(false);
    }
  };

  // If the person already signed in with YouTube and/or Reddit (on the
  // Connected Platforms screen, any time before or during the session),
  // pull their activity in automatically the moment the assessment
  // finishes — no separate manual "Analyze" click needed. Guarded so each
  // only fires once per completed session; resetAssessment() re-arms both
  // for the next one. Fetched in parallel so one slow platform doesn't
  // delay the other from landing in the report.
  useEffect(() => {
    if (interviewComplete && !socialAutoFetchedRef.current) {
      socialAutoFetchedRef.current = true;
      if (youtubeConnected) loadYoutubeProfile();
      if (redditConnected) loadRedditProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewComplete, youtubeConnected, redditConnected]);

  // Keep a rolling window of recent live webcam readings (avoids unbounded growth
  // over a long session while still giving report generation enough signal).
  const MAX_FACE_SAMPLES = 120;

  const recordFaceEmotion = (readingResult: FaceEmotionReading) => {
    setFaceEmotionSamples((prev) => {
      const sample: FacialEmotionSample = {
        timestamp: readingResult.timestamp,
        dominantEmotion: readingResult.dominantEmotion,
        confidence: readingResult.confidence,
        expressions: readingResult.expressions,
        questionId: interviewTurnNumber,
      };
      const next = [...prev, sample];
      return next.length > MAX_FACE_SAMPLES ? next.slice(next.length - MAX_FACE_SAMPLES) : next;
    });
  };

  const currentFaceEmotion = faceEmotionSamples.length > 0
    ? faceEmotionSamples[faceEmotionSamples.length - 1]
    : null;

  const MAX_VOICE_SAMPLES = 60;

  const recordVoiceEmotion = (result: VoiceEmotionResult, questionId: number) => {
    setVoiceEmotionSamples((prev) => {
      const sample: VoiceEmotionSample = {
        timestamp: Date.now(),
        dominantEmotion: result.label,
        confidence: result.score,
        expressions: result.allScores,
        questionId,
      };
      const next = [...prev, sample];
      return next.length > MAX_VOICE_SAMPLES ? next.slice(next.length - MAX_VOICE_SAMPLES) : next;
    });
  };

  // Deterministic keyword check — deliberately not model-based, see
  // utils/crisisDetection.ts. Runs on every free-text answer and on the
  // PHQ-9 self-harm item.
  const triggerCrisisCheck = (text: string) => {
    if (detectCrisisLanguage(text)) {
      setCrisisFlag(true);
      setCrisisEverFlagged(true);
    }
  };

  const dismissCrisisFlag = () => setCrisisFlag(false);

  const answerScreenerQuestion = (questionId: string, value: number) => {
    setScreenerResponses((prev) => ({ ...prev, [questionId]: value }));
    if (questionId === PHQ9_SELF_HARM_ITEM_ID && value > 0) {
      setCrisisFlag(true);
      setCrisisEverFlagged(true);
    }
  };

  const screenerComplete = isScreenerComplete(screenerResponses);

  // Kicks off the adaptive interview with a hardcoded, instant opening line
  // (asks the person's age) — every question after this one is generated by
  // /api/interview based on the growing conversation history, so it can
  // shape follow-ups around age and whatever the person has actually said.
  const startInterview = (lang?: string) => {
    const opener = buildInterviewOpener(user.fullName, lang);
    const initial: InterviewMessage[] = [{ role: 'assistant', content: opener }];
    interviewMessagesRef.current = initial;
    setInterviewMessages(initial);
    setCurrentAiQuestion(opener);
    setInterviewTurnNumber(1);
    setInterviewComplete(false);
    setInterviewLoading(false);
  };

  const FALLBACK_CLOSING_LINE =
    "Sorry — I lost my connection for a second there. Thanks for sharing what you did; let's wrap this part up.";

  const recordAnswer = (answerText: string, language?: string) => {
    triggerCrisisCheck(answerText);
    const turnNumber = interviewTurnNumber;
    // Provisional sentiment shown instantly; the real pretrained-model
    // classification below patches it in once inference resolves (typically
    // a few hundred ms), so navigation never blocks on it.
    const newAnswer: AssessmentAnswer = {
      questionId: turnNumber,
      questionText: currentAiQuestion,
      userResponseText: answerText,
      sentiment: answerText.length > 30 ? 'Calm' : 'Neutral',
      confidence: 70,
      speechDurationSec: Math.max(12, Math.floor(answerText.length / 4)),
      facialEmotion: currentFaceEmotion?.dominantEmotion,
    };

    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== turnNumber);
      return [...filtered, newAnswer];
    });

    // Real linguistic-emotion classification (DistilRoBERTa ONNX model via
    // transformers.js, running fully in-browser) replaces the placeholder above.
    classifyTextEmotion(answerText).then((result) => {
      if (!result) return;
      setAnswers((prev) =>
        prev.map((a) =>
          a.questionId === turnNumber
            ? {
                ...a,
                sentiment: mapEmotionToSentiment(result.label, result.score),
                confidence: Number((result.score * 100).toFixed(1)),
                linguisticEmotion: result.label,
                linguisticConfidence: result.score,
              }
            : a
        )
      );
    });

    // Ask LLM for the next adaptive question, reading from atomic ref to eliminate stale closure bugs
    const historyWithAnswer: InterviewMessage[] = [
      ...interviewMessagesRef.current,
      { role: 'user', content: answerText },
    ];
    interviewMessagesRef.current = historyWithAnswer;
    setInterviewMessages(historyWithAnswer);
    setInterviewLoading(true);

    const INTERVIEW_TIMEOUT_MS = 6000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), INTERVIEW_TIMEOUT_MS);
    const targetLang = language || 'en-IN';
    const reqStart = Date.now();

    console.log(`[MindCare Interview API] Dispatching turn ${turnNumber} (lang: ${targetLang})...`);

    fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: historyWithAnswer,
        name: user.fullName,
        faceEmotion: currentFaceEmotion?.dominantEmotion,
        language: targetLang,
      }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { reply: string; mood_tag?: string; continue_interview: boolean }) => {
        clearTimeout(timeoutId);
        console.log(`[MindCare Interview API] Turn ${turnNumber} received in ${Date.now() - reqStart}ms:`, data.reply);
        const updatedHistory: InterviewMessage[] = [
          ...interviewMessagesRef.current,
          { role: 'assistant', content: data.reply },
        ];
        interviewMessagesRef.current = updatedHistory;
        setInterviewMessages(updatedHistory);
        setCurrentAiQuestion(data.reply);
        setInterviewTurnNumber((prev) => prev + 1);
        setInterviewComplete(!data.continue_interview);
        setInterviewLoading(false);
        if (data.mood_tag) {
          const capitalized = (data.mood_tag.charAt(0).toUpperCase() + data.mood_tag.slice(1)) as any;
          setAnswers((prev) =>
            prev.map((a) =>
              a.questionId === turnNumber && a.sentiment === 'Neutral'
                ? { ...a, sentiment: capitalized }
                : a
            )
          );
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.warn(`[MindCare Interview API] Turn ${turnNumber} failed after ${Date.now() - reqStart}ms:`, err);
        const fallbackHistory: InterviewMessage[] = [
          ...interviewMessagesRef.current,
          { role: 'assistant', content: FALLBACK_CLOSING_LINE },
        ];
        interviewMessagesRef.current = fallbackHistory;
        setInterviewMessages(fallbackHistory);
        setCurrentAiQuestion(FALLBACK_CLOSING_LINE);
        setInterviewComplete(true);
        setInterviewLoading(false);
      });
  };

  const resetAssessment = () => {
    interviewMessagesRef.current = [];
    setInterviewMessages([]);
    setCurrentAiQuestion('');
    setInterviewTurnNumber(0);
    setInterviewLoading(false);
    setInterviewComplete(false);
    setAnswers([]);
    setFaceEmotionSamples([]);
    setVoiceEmotionSamples([]);
    setScreenerResponses({});
    setCrisisEverFlagged(false);
    setSharedDoctor(null);
    historySavedRef.current = false;
    socialAutoFetchedRef.current = false;
    setScreen('dashboard');
  };

  const toggleCamera = () => setCameraOn((prev) => !prev);
  const toggleMic = () => setMicMuted((prev) => !prev);
  const toggleBackgroundBlur = () => setBackgroundBlur((prev) => !prev);

  const setTheme = (t: 'light' | 'dark' | 'calm') => {
    setThemeState(t);
  };

  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleLargeFont = () => setLargeFont((prev) => !prev);

  // Sync dataset once the adaptive interview has finished
  useEffect(() => {
    if (interviewComplete && answers.length > 0) {
      // Dynamic updates to report evidence quotes based on actual user answers
      const updatedEvidence = answers.map((ans, idx) => ({
        id: `ev_live_${idx}`,
        source: 'Live Audio Transcript' as const,
        quote: `"${ans.userResponseText.slice(0, 70)}${ans.userResponseText.length > 70 ? '...' : ''}"`,
        sentiment: ans.sentiment,
        timestamp: `Question ${idx + 1} of the interview`,
      }));

      // Aggregate the live webcam facial-expression samples (real face-api.js
      // pretrained-model inference, collected throughout the session) into a
      // facial-dynamics signal for the report — replaces the static mock entry.
      let facialEvidence: RetrievedEvidenceItem | null = null;
      let facialShapFeature: MentalHealthReport['shapFeatures'][number] | null = null;
      let facialConditionAdjustment = 0;

      if (faceEmotionSamples.length > 0) {
        const totals: Record<string, number> = {};
        faceEmotionSamples.forEach((s) => {
          Object.entries(s.expressions).forEach(([k, v]) => {
            totals[k] = (totals[k] || 0) + v;
          });
        });
        const n = faceEmotionSamples.length;
        const avg: Record<string, number> = {};
        Object.keys(totals).forEach((k) => (avg[k] = totals[k] / n));

        const negativeScore = (avg.sad || 0) + (avg.angry || 0) + (avg.fearful || 0) + (avg.disgusted || 0);
        const positiveScore = avg.happy || 0;
        const [dominantOverall, dominantConfidence] =
          Object.entries(avg).sort((a, b) => b[1] - a[1])[0] || ['neutral', 0];

        facialEvidence = {
          id: 'ev_face_live',
          source: 'Facial Micro-expression' as const,
          quote: `Live webcam analysis (face-api.js pretrained CNN): dominant expression "${dominantOverall}" across ${n} sampled frames (avg confidence ${(dominantConfidence * 100).toFixed(0)}%).`,
          sentiment: negativeScore > positiveScore ? 'Mild Distress' : 'Calm',
          timestamp: 'Live Session • Facial Analysis',
        };

        facialShapFeature = {
          feature: 'Live Facial Affect Distribution (face-api.js)',
          category: 'Facial Dynamics',
          impactValue: Number((negativeScore - positiveScore).toFixed(2)),
          formattedValue: `${(negativeScore * 100).toFixed(1)}% negative affect / ${(positiveScore * 100).toFixed(1)}% positive affect`,
          explanation: `Aggregated from ${n} live webcam frames captured during the session; a higher negative-affect share (sadness/anger/fear/disgust) pushes the risk estimate up, positive affect is protective.`,
        };

        facialConditionAdjustment = Math.round((negativeScore - positiveScore) * 30);
      }

      // Aggregate the real per-answer linguistic-emotion classifications
      // (DistilRoBERTa ONNX model, transformers.js) into a linguistic-sentiment
      // signal — replaces the static mock "Positive Emotional Vocabulary Ratio" entry.
      let linguisticEvidence: RetrievedEvidenceItem | null = null;
      let linguisticShapFeature: MentalHealthReport['shapFeatures'][number] | null = null;
      let linguisticConditionAdjustment = 0;

      const classifiedAnswers = answers.filter((a) => a.linguisticEmotion);
      if (classifiedAnswers.length > 0) {
        const positiveCount = classifiedAnswers.filter((a) => a.linguisticEmotion === 'joy').length;
        const negativeCount = classifiedAnswers.filter((a) => isNegativeEmotion(a.linguisticEmotion || '')).length;
        const positiveRatio = positiveCount / classifiedAnswers.length;
        const negativeRatio = negativeCount / classifiedAnswers.length;

        const freq: Record<string, number> = {};
        classifiedAnswers.forEach((a) => {
          const label = a.linguisticEmotion as string;
          freq[label] = (freq[label] || 0) + 1;
        });
        const dominantLabel = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

        linguisticEvidence = {
          id: 'ev_linguistic_live',
          source: 'Self-Report Response' as const,
          quote: `Live linguistic-emotion analysis (DistilRoBERTa, in-browser): dominant tone "${dominantLabel}" across ${classifiedAnswers.length} responses (${(positiveRatio * 100).toFixed(0)}% positive, ${(negativeRatio * 100).toFixed(0)}% negative markers).`,
          sentiment: negativeRatio > positiveRatio ? 'Mild Distress' : 'Positive',
          timestamp: 'Live Session • Linguistic Analysis',
        };

        linguisticShapFeature = {
          feature: 'Live Linguistic Emotion Classification (DistilRoBERTa)',
          category: 'Linguistic Sentiment',
          impactValue: Number((negativeRatio - positiveRatio).toFixed(2)),
          formattedValue: `${(positiveRatio * 100).toFixed(0)}% positive / ${(negativeRatio * 100).toFixed(0)}% negative tone`,
          explanation: `Classified from ${classifiedAnswers.length} spoken/typed responses using a pretrained emotion-classification model; a higher negative-tone share (sadness/fear/anger/disgust) pushes the risk estimate up, joy is protective.`,
        };

        linguisticConditionAdjustment = Math.round((negativeRatio - positiveRatio) * 25);
      }

      // Aggregate real acoustic (vocal-tone) classifications — analyzes HOW
      // each answer was said, captured from the actual mic recording, not
      // the transcribed words.
      let acousticEvidence: RetrievedEvidenceItem | null = null;
      let acousticShapFeature: MentalHealthReport['shapFeatures'][number] | null = null;
      let acousticConditionAdjustment = 0;

      const acousticAnswers = answers.filter((a) => a.acousticEmotion);
      if (acousticAnswers.length > 0) {
        const positiveCount = acousticAnswers.filter((a) => a.acousticEmotion === 'HAPPY').length;
        const negativeCount = acousticAnswers.filter((a) => isNegativeVoiceEmotion(a.acousticEmotion || '')).length;
        const positiveRatio = positiveCount / acousticAnswers.length;
        const negativeRatio = negativeCount / acousticAnswers.length;

        const freq: Record<string, number> = {};
        acousticAnswers.forEach((a) => {
          const label = a.acousticEmotion as string;
          freq[label] = (freq[label] || 0) + 1;
        });
        const dominantLabel = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'NEUTRAL';

        acousticEvidence = {
          id: 'ev_acoustic_live',
          source: 'Live Audio Transcript' as const,
          quote: `Live vocal-tone analysis (wav2vec2, in-browser): dominant tone "${dominantLabel}" across ${acousticAnswers.length} recorded answers (${(positiveRatio * 100).toFixed(0)}% positive, ${(negativeRatio * 100).toFixed(0)}% negative markers).`,
          sentiment: negativeRatio > positiveRatio ? 'Mild Distress' : 'Calm',
          timestamp: 'Live Session • Acoustic Analysis',
        };

        acousticShapFeature = {
          feature: 'Live Vocal Tone Classification (wav2vec2)',
          category: 'Speech Acoustics',
          impactValue: Number((negativeRatio - positiveRatio).toFixed(2)),
          formattedValue: `${(positiveRatio * 100).toFixed(0)}% positive / ${(negativeRatio * 100).toFixed(0)}% negative vocal tone`,
          explanation: `Classified from ${acousticAnswers.length} recorded answer clips using a pretrained acoustic emotion model (pitch/prosody, not word content); a higher negative-tone share pushes the risk estimate up.`,
        };

        acousticConditionAdjustment = Math.round((negativeRatio - positiveRatio) * 20);
      }

      // Real validated clinical screeners (PHQ-9 / GAD-7), when completed,
      // directly set the two matching condition scores instead of the
      // multimodal signals nudging a fabricated baseline — this is the one
      // piece of the report backed by an actual diagnostic instrument.
      const phq9 = screenerComplete ? scorePHQ9(screenerResponses) : null;
      const gad7 = screenerComplete ? scoreGAD7(screenerResponses) : null;

      const screenerSeverityToConditionSeverity = (sev: string): 'Optimal' | 'Mild' | 'Moderate' | 'Severe' => {
        if (sev === 'Minimal') return 'Optimal';
        if (sev === 'Mild') return 'Mild';
        if (sev === 'Moderate') return 'Moderate';
        return 'Severe'; // Moderately Severe / Severe
      };

      const trendVsHistory = (metric: 'phq9Total' | 'gad7Total', total: number): 'Stable' | 'Improving' | 'Requires Attention' => {
        const last = reportHistory[reportHistory.length - 1];
        if (!last || last[metric] === undefined) return 'Stable';
        const prevTotal = last[metric] as number;
        if (total < prevTotal) return 'Improving';
        if (total > prevTotal) return 'Requires Attention';
        return 'Stable';
      };

      const computedOverallScore = Math.min(
        95,
        Math.max(
          5,
          75 +
            Math.floor(answers.length * 2) -
            facialConditionAdjustment -
            linguisticConditionAdjustment -
            acousticConditionAdjustment -
            (phq9 ? Math.round(phq9.total * 1.2) : 0) -
            (gad7 ? Math.round(gad7.total * 1.2) : 0)
        )
      );

      setReport((prev) => {
        const conditions = prev.conditions.map((c) => {
          if (c.name === 'Depressive Affect Index') {
            if (phq9) {
              const score = Math.round((phq9.total / phq9.maxTotal) * 100);
              return {
                ...c,
                score,
                severity: screenerSeverityToConditionSeverity(phq9.severity),
                description: `PHQ-9 validated screener: ${phq9.total}/27 (${phq9.severity}). Supported by ${acousticAnswers.length + classifiedAnswers.length} multimodal signal(s) below.`,
                changeTrend: trendVsHistory('phq9Total', phq9.total),
              };
            }
            if (facialConditionAdjustment) {
              const score = Math.max(0, Math.min(100, c.score + facialConditionAdjustment));
              const severity = scoreToSeverity(score);
              return { ...c, score, severity, description: describeFacialCondition(severity) };
            }
          }
          if (c.name === 'Generalized Anxiety Marker') {
            if (gad7) {
              const score = Math.round((gad7.total / gad7.maxTotal) * 100);
              return {
                ...c,
                score,
                severity: screenerSeverityToConditionSeverity(gad7.severity),
                description: `GAD-7 validated screener: ${gad7.total}/21 (${gad7.severity}). Supported by ${acousticAnswers.length + classifiedAnswers.length} multimodal signal(s) below.`,
                changeTrend: trendVsHistory('gad7Total', gad7.total),
              };
            }
            if (linguisticConditionAdjustment) {
              const score = Math.max(0, Math.min(100, c.score + linguisticConditionAdjustment));
              const severity = scoreToSeverity(score);
              return { ...c, score, severity, description: describeLinguisticCondition(severity) };
            }
          }
          // Previously always left as static mock data (58/Moderate) no
          // matter what actually happened in the session — the app collects
          // no dedicated PSQI instrument, but PHQ-9's own sleep item (asked
          // whenever the screener is used) is a real, if partial, signal.
          if (c.name === 'Sleep Quality Index (PSQI)') {
            const sleepItemValue = screenerResponses[PHQ9_SLEEP_ITEM_ID];
            if (sleepItemValue !== undefined) {
              const score = Math.round((sleepItemValue / 3) * 100);
              const severity = scoreToSeverity(score);
              return { ...c, score, severity, description: describeSleepCondition(severity, sleepItemValue) };
            }
          }
          // Previously always left as static mock data (84/Optimal) — uses
          // the same classified-answer set as the anxiety marker above, but
          // reads the positive/constructive-language share instead of the
          // negative share, as a real proxy for active coping language.
          if (c.name === 'Resilience & Coping Capacity' && classifiedAnswers.length > 0) {
            const positiveCount = classifiedAnswers.filter((a) => a.linguisticEmotion === 'joy').length;
            const score = Math.round((positiveCount / classifiedAnswers.length) * 100);
            const severity = scoreToSeverityInverse(score);
            return { ...c, score, severity, description: describeResilienceCondition(severity) };
          }
          return c;
        });

        const shapFeatures = [
          ...(facialShapFeature ? [facialShapFeature] : []),
          ...(linguisticShapFeature ? [linguisticShapFeature] : []),
          ...(acousticShapFeature ? [acousticShapFeature] : []),
          ...prev.shapFeatures.filter(
            (f) => f.category !== 'Facial Dynamics' && f.category !== 'Linguistic Sentiment' && f.category !== 'Speech Acoustics'
          ),
        ];

        // No longer backfilled from the static mock's fake "Reddit forum
        // activity logged in r/mindfulness..." entry — that quote described
        // a connection that may never have happened this session, presented
        // as if it were real evidence. Real social evidence (when the person
        // actually connects YouTube/Reddit/Instagram) is added separately by
        // loadYoutubeProfile / loadRedditProfile / analyzeInstagramExportFile.
        const retrievedEvidence = [
          ...updatedEvidence,
          ...(facialEvidence ? [facialEvidence] : []),
          ...(linguisticEvidence ? [linguisticEvidence] : []),
          ...(acousticEvidence ? [acousticEvidence] : []),
          ...prev.retrievedEvidence.filter((e) => e.source === 'Social Data Feed'),
        ];

        const recommendations = crisisEverFlagged
          ? [
              {
                id: 'rec_safety',
                title: 'Reach Out to a Crisis Support Line',
                description:
                  'Language suggesting significant distress was detected during this session. Please consider speaking with a licensed professional or a crisis support line — you do not have to go through this alone.',
                category: 'Clinical Follow-up' as const,
                priority: 'High' as const,
              },
              ...prev.recommendations.filter((r) => r.id !== 'rec_safety'),
            ]
          : prev.recommendations;

        const riskLevel: MentalHealthReport['riskLevel'] = crisisEverFlagged
          ? 'High'
          : (phq9 && phq9.total >= 15) || (gad7 && gad7.total >= 15)
          ? 'High'
          : (phq9 && phq9.total >= 10) || (gad7 && gad7.total >= 10)
          ? 'Moderate'
          : prev.riskLevel;

        // Persist a snapshot of this completed session once, for trend
        // tracking — computed alongside the report update so the saved
        // numbers always match what's actually shown.
        if (!historySavedRef.current) {
          historySavedRef.current = true;
          const entry: ReportHistoryEntry = {
            date: new Date().toISOString(),
            completionDate: prev.completionDate,
            overallScore: computedOverallScore,
            riskLevel,
            phq9Total: phq9?.total,
            gad7Total: gad7?.total,
          };
          setReportHistory((prevHistory) => {
            const nextHistory = [...prevHistory, entry];
            try {
              window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
            } catch (e) {
              console.warn('Could not persist report history:', e);
            }
            return nextHistory;
          });
        }

        return {
          ...prev,
          conditions,
          shapFeatures,
          retrievedEvidence,
          recommendations,
          riskLevel,
          overallScore: computedOverallScore,
          overallStatus: deriveOverallStatus(riskLevel, conditions),
        };
      });
    }
  }, [interviewComplete, answers, faceEmotionSamples, voiceEmotionSamples, screenerComplete, screenerResponses, crisisEverFlagged]);

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        user,
        setUser,
        loginUser,
        logoutUser,
        consent,
        updateConsent,
        socialPlatforms,
        toggleSocialPlatform,
        updateSocialHandle,
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
        currentAiQuestion,
        interviewTurnNumber,
        interviewLoading,
        interviewComplete,
        startInterview,
        answers,
        recordAnswer,
        resetAssessment,
        report,
        faceEmotionSamples,
        currentFaceEmotion,
        recordFaceEmotion,
        voiceEmotionSamples,
        recordVoiceEmotion,
        screenerResponses,
        answerScreenerQuestion,
        screenerComplete,
        crisisFlag,
        dismissCrisisFlag,
        reportHistory,
        sharedDoctor,
        setSharedDoctor,
        cameraOn,
        setCameraOn,
        toggleCamera,
        micMuted,
        setMicMuted,
        toggleMic,
        backgroundBlur,
        toggleBackgroundBlur,
        theme,
        setTheme,
        highContrast,
        toggleHighContrast,
        largeFont,
        toggleLargeFont,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
