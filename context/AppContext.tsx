'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AssessmentAnswer,
  AssessmentQuestion,
  MentalHealthReport,
  PrivacyConsentState,
  ScreenId,
  SocialPlatform,
  UserProfile,
} from '../types/mindcare';
import {
  ASSESSMENT_QUESTIONS,
  DEFAULT_SOCIAL_PLATFORMS,
  INITIAL_REPORT,
  INITIAL_USER,
} from '../utils/mockData';

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
  questions: AssessmentQuestion[];
  currentQuestionIndex: number;
  answers: AssessmentAnswer[];
  recordAnswer: (answerText: string) => void;
  goToQuestion: (index: number) => void;
  resetAssessment: () => void;
  report: MentalHealthReport;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [report, setReport] = useState<MentalHealthReport>(INITIAL_REPORT);

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

  const recordAnswer = (answerText: string) => {
    const question = ASSESSMENT_QUESTIONS[currentQuestionIndex];
    const newAnswer: AssessmentAnswer = {
      questionId: question.id,
      questionText: question.questionText,
      userResponseText: answerText,
      sentiment: answerText.length > 30 ? 'Calm' : 'Neutral',
      confidence: 91.5,
      speechDurationSec: Math.max(12, Math.floor(answerText.length / 4)),
    };

    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== question.id);
      return [...filtered, newAnswer];
    });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < ASSESSMENT_QUESTIONS.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const resetAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
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

  // Sync dataset when answers complete
  useEffect(() => {
    if (answers.length === ASSESSMENT_QUESTIONS.length && answers.length > 0) {
      // Dynamic updates to report evidence quotes based on actual user answers
      const updatedEvidence = answers.map((ans, idx) => ({
        id: `ev_live_${idx}`,
        source: 'Live Audio Transcript' as const,
        quote: `"${ans.userResponseText.slice(0, 70)}${ans.userResponseText.length > 70 ? '...' : ''}"`,
        sentiment: ans.sentiment,
        timestamp: `Question ${ans.questionId} • ${ASSESSMENT_QUESTIONS[idx]?.domain || 'Assessment'}`,
      }));

      setReport((prev) => ({
        ...prev,
        retrievedEvidence: [...updatedEvidence, ...prev.retrievedEvidence.slice(0, 2)],
        overallScore: Math.min(95, 75 + Math.floor(answers.length * 2)),
      }));
    }
  }, [answers]);

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
        questions: ASSESSMENT_QUESTIONS,
        currentQuestionIndex,
        answers,
        recordAnswer,
        goToQuestion,
        resetAssessment,
        report,
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
