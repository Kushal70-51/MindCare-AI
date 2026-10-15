'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useVoiceEmotion } from '../../hooks/useVoiceEmotion';
import { AiVoiceOrb } from '../ui/AiVoiceOrb';
import { CameraPreview } from '../ui/CameraPreview';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { AssessmentStepper } from '../ui/AssessmentStepper';
import { buildInterviewOpener } from '../../utils/mockData';

export const CLINICAL_DOMAINS_MAP = [
  'Emotional Rapport & Age Baseline',
  'Sleep Architecture & Circadian Rest',
  'Energy, Fatigue & Daily Vitality',
  'Acute Stressors & Cognitive Pressure',
  'Anxiety & Somatic Tension',
  'Affect & Depressive Symptoms',
  'Social Connectedness & Support',
  'Coping Mechanisms & Self-Worth',
];
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  Send,
  RotateCcw,
  Globe,
  Clock,
  Sparkles,
  FastForward,
  Smile,
  Bot,
  User,
  Check,
  ArrowRight,
  ArrowDown,
  Shield,
  Activity,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LanguageOption {
  code: string;
  name: string;
  nativeLabel: string;
  flag: string;
  hint: string;
  placeholder: string;
  quickChips: string[];
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en-IN',
    name: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    hint: 'Interviewer speaks and listens in English',
    placeholder: 'Speak or type your response in English (e.g. I feel stressed with work)...',
    quickChips: [
      'I am 22 years old',
      'Feeling constantly stressed and anxious',
      'Having trouble sleeping and feeling exhausted',
      'Everything is going reasonably well',
    ],
  },
  {
    code: 'hi-IN',
    name: 'हिन्दी (Hindi)',
    nativeLabel: 'हिन्दी',
    flag: '🇮🇳',
    hint: 'इन्टरव्यूअर शुद्ध व सरल हिन्दी में बोलेगा और सुनेगा',
    placeholder: 'यहाँ बोलें या लिखें... (जैसे: मेरी उम्र 22 वर्ष है, या Hinglish में)',
    quickChips: [
      'मेरी उम्र 21 साल है',
      'मुझे बहुत तनाव और चिंता महसूस होती है',
      'रात को नींद नहीं आती, दिनभर थकान रहती है',
      'सब कुछ ठीक चल रहा है',
    ],
  },
  {
    code: 'mr-IN',
    name: 'मराठी (Marathi)',
    nativeLabel: 'मराठी',
    flag: '🇮🇳',
    hint: 'मुलाखतकार अस्खलित मराठीत बोलेल आणि ऐकेल',
    placeholder: 'येथे बोला किंवा लिहा... (उदा. माझे वय 23 वर्षे आहे, किंवा Marathinglish मध्ये)',
    quickChips: [
      'माझे वय 22 वर्षे आहे',
      'मला कामाचा खूप ताण येत आहे',
      'रात्री शांत झोप लागत नाही, थकवा जाणवतो',
      'सगळं काही ठीक चाललं आहे',
    ],
  },
];

export const AssessmentInterfaceScreen: React.FC = () => {
  const {
    user,
    setScreen,
    currentAiQuestion,
    setCurrentAiQuestion,
    interviewTurnNumber,
    interviewDurationSec,
    concludeInterview,
    interviewComplete,
    startInterview,
    recordAnswer,
    cameraOn,
    toggleCamera,
    micMuted,
    toggleMic,
    backgroundBlur,
    toggleBackgroundBlur,
    showToast,
    recordFaceEmotion,
    currentFaceEmotion,
    recordVoiceEmotion,
    streamingAiText,
  } = useApp() as any;

  const formatDuration = (totalSec: number = 0) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Language Selection Pre-Step — if interview is already active in this session, don't trap user
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(() => {
    if (interviewTurnNumber > 0) return true;
    return false;
  });
  const [userInput, setUserInput] = useState('');
  const [interimDisplay, setInterimDisplay] = useState('');
  const [aiMode, setAiMode] = useState<'speaking' | 'listening' | 'thinking'>('speaking');
  const [transcript, setTranscript] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string; moodTag?: string }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isFullScreenVideo, setIsFullScreenVideo] = useState(false);

  // Multilingual & Accent Settings — load persisted choice if available
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('mindcare_lang');
        if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
          return saved;
        }
      } catch (e) {}
    }
    return 'en-IN';
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [autoSubmit, setAutoSubmit] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Auto-scroll and Chat Scroll Management
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState<boolean>(false);
  const [newMessagesWhileScrolled, setNewMessagesWhileScrolled] = useState<number>(0);
  const lastTranscriptLengthRef = useRef<number>(0);

  const isManuallyEditedRef = useRef<boolean>(false);
  const sessionPrefixRef = useRef<string>('');
  const userInputRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownValRef = useRef<number>(0);
  const hasSubmittedRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const lastSpokenTextRef = useRef<string>('');

  // Synchronized state & ref updater to prevent any stale React closures in timers
  const setInputValue = (val: string) => {
    userInputRef.current = val;
    setUserInput(val);
  };

  // Dedicated container-level scroll handler that never jitters the outer page window
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = chatContainerRef.current;
    if (!el) {
      messagesEndRef.current?.scrollIntoView({ behavior });
      return;
    }
    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
    setIsUserScrolledUp(false);
    setNewMessagesWhileScrolled(0);
  };

  // Real-time scroll detector: tracks if user has scrolled up to read earlier history
  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const scrolledUp = distanceFromBottom > 60;
    setIsUserScrolledUp(scrolledUp);
    if (!scrolledUp) {
      setNewMessagesWhileScrolled(0);
    }
  };

  const toggleAutoScroll = () => {
    setAutoScroll((prev) => {
      const next = !prev;
      if (next) {
        scrollToBottom('smooth');
        showToast('Auto-scroll turned ON');
      } else {
        showToast('Auto-scroll PAUSED — browse chat freely');
      }
      return next;
    });
  };

  // Smart auto-scroll: smooth for finalized responses, instant for live streaming tokens, pauses when user scrolls up
  useEffect(() => {
    if (!autoScroll) return;

    if (isUserScrolledUp) {
      if (transcript.length > lastTranscriptLengthRef.current) {
        setNewMessagesWhileScrolled((prev) => prev + (transcript.length - lastTranscriptLengthRef.current));
      }
      lastTranscriptLengthRef.current = transcript.length;
      return;
    }

    lastTranscriptLengthRef.current = transcript.length;

    // Use instant 'auto' during active token streaming or live interim speech to prevent stutter
    const behavior: ScrollBehavior = (streamingAiText || interimDisplay) ? 'auto' : 'smooth';
    scrollToBottom(behavior);
  }, [transcript, streamingAiText, interimDisplay, autoScroll, isUserScrolledUp]);

  // Reliable helper to ensure speech synthesis voices are populated in Chromium/Edge
  const ensureVoicesReady = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve([]);
        return;
      }
      const existing = window.speechSynthesis.getVoices();
      if (existing && existing.length > 0) {
        resolve(existing);
        return;
      }
      let resolved = false;
      const onVoicesChanged = () => {
        if (resolved) return;
        resolved = true;
        window.speechSynthesis.onvoiceschanged = null;
        resolve(window.speechSynthesis.getVoices() || []);
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        window.speechSynthesis.onvoiceschanged = null;
        resolve(window.speechSynthesis.getVoices() || []);
      }, 1200);
    });
  };

  // Load and cache browser speech synthesis voices reliably on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    ensureVoicesReady().then((vs) => {
      if (vs && vs.length > 0) {
        setAvailableVoices(vs);
      }
    });

    const onVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      if (vs && vs.length > 0) {
        setAvailableVoices(vs);
      }
    };
    window.speechSynthesis.onvoiceschanged = onVoices;
  }, []);

  // Records audio samples per question for wav2vec2 acoustic tone classification
  useVoiceEmotion(aiMode === 'listening' && !micMuted, interviewTurnNumber, recordVoiceEmotion);

  // Start interview with selected language opener once language is confirmed (fallback if not triggered via handleStartConsultation)
  useEffect(() => {
    if (hasSelectedLanguage && transcript.length === 0) {
      const opener = buildInterviewOpener(user?.fullName, selectedLang);
      setTranscript([
        {
          sender: 'ai',
          text: opener,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      startInterview(selectedLang);
      lastSpokenTextRef.current = opener;
      setTimeout(() => {
        speakText(opener, selectedLang, () => {
          setTimeout(() => setAiMode('listening'), 500);
        });
      }, 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSelectedLanguage]);

  // Helper to find the best matching browser TTS voice and its effective language tag
  const getBestVoice = (
    langCode: string,
    voiceList?: SpeechSynthesisVoice[]
  ): { voice: SpeechSynthesisVoice | null; actualLang: string } => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { voice: null, actualLang: langCode };
    }
    const voices =
      voiceList && voiceList.length > 0
        ? voiceList
        : availableVoices.length > 0
        ? availableVoices
        : window.speechSynthesis.getVoices();

    if (!voices || voices.length === 0) return { voice: null, actualLang: langCode };

    const norm = langCode.toLowerCase();

    // 1. Hindi (hi-IN)
    if (norm.startsWith('hi')) {
      const hiVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          /hindi|हिन्दी|kalpana|hemant|swara|madhur|ananya/i.test(v.name)
      );
      if (hiVoice) {
        return { voice: hiVoice, actualLang: hiVoice.lang || 'hi-IN' };
      }
    }

    // 2. Marathi (mr-IN)
    if (norm.startsWith('mr')) {
      const mrVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('mr') ||
          /marathi|मराठी|aarohi/i.test(v.name)
      );
      if (mrVoice) {
        return { voice: mrVoice, actualLang: mrVoice.lang || 'mr-IN' };
      }

      // Marathi fallback to Hindi Devanagari voice if Marathi voice isn't installed in OS
      const hiFallback = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          /hindi|हिन्दी|kalpana|hemant|swara|madhur/i.test(v.name)
      );
      if (hiFallback) {
        console.warn(
          '[MindCare TTS] Native Marathi voice not found in OS. Falling back to Hindi Devanagari voice for accurate pronunciation:',
          hiFallback.name
        );
        return { voice: hiFallback, actualLang: hiFallback.lang || 'hi-IN' };
      }
    }

    // 3. Indian English (en-IN)
    const enInVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === 'en-in' ||
        /india|neerja|ravi|prabhat/i.test(v.name)
    );
    if (enInVoice) return { voice: enInVoice, actualLang: enInVoice.lang || 'en-IN' };

    // 4. Natural English (US/GB)
    const enNatural = voices.find(
      (v) =>
        /samantha|aria|jenny|natural|google uk english female/i.test(v.name) ||
        /female|zira/i.test(v.name) ||
        /en-US|en-GB/i.test(v.lang)
    );
    if (enNatural) return { voice: enNatural, actualLang: enNatural.lang || 'en-US' };

    // 5. Fallback: closest available voice
    return { voice: voices[0] || null, actualLang: voices[0]?.lang || langCode };
  };

  // Speaks any arbitrary text in the selected language using Web Speech API with voice-ready wait
  const speakText = async (text: string, langCode: string, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      if (onEndCallback) setTimeout(onEndCallback, 1200);
      return;
    }

    // Ensure voices are loaded before dispatching utterance
    let voices = availableVoices;
    if (!voices || voices.length === 0) {
      voices = await ensureVoicesReady();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    setAiMode('speaking');
    isSpeakingRef.current = true;
    lastSpokenTextRef.current = text;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 1.0;

    const { voice: matchedVoice, actualLang } = getBestVoice(langCode, voices);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    // Setting utterance.lang to match the actual voice avoids Chromium dropping audio on mismatch
    utterance.lang = actualLang;

    console.log('[MindCare TTS] Speaking utterance:', {
      text: text.slice(0, 45) + (text.length > 45 ? '...' : ''),
      targetLang: langCode,
      actualLang,
      voiceName: matchedVoice?.name || 'System Default',
    });

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      isSpeakingRef.current = false;
      if (onEndCallback) onEndCallback();
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      console.warn('[MindCare TTS] Utterance error:', e);
      finish();
    };

    // Safety net in case speech engine stalls
    const safetyMs = Math.max(2500, text.length * 80 + 3500);
    setTimeout(() => {
      if (!finished && isSpeakingRef.current) {
        console.warn('[MindCare TTS] Utterance safety timeout reached');
        finish();
      }
    }, safetyMs);

    window.speechSynthesis.speak(utterance);
  };

  // Handle language change by user — switches voice, greeting, and STT immediately without race conditions
  const handleLanguageChange = (newLangCode: string) => {
    if (newLangCode === selectedLang) return;

    cancelCountdown();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    setSelectedLang(newLangCode);

    showToast(
      newLangCode.startsWith('hi')
        ? 'हिन्दी भाषा चुनी गई — इन्टरव्यूअर अब हिन्दी में बात करेगा'
        : newLangCode.startsWith('mr')
        ? 'मराठी भाषा निवडली — मुलाखतकार आता मराठीत संवाद साधेल'
        : 'Language switched to English — interviewer will speak in English'
    );

    // If still on Turn 1, translate opener and speak immediately
    if (interviewTurnNumber <= 1) {
      const localizedOpener = buildInterviewOpener(user?.fullName, newLangCode);
      if (typeof setCurrentAiQuestion === 'function') {
        setCurrentAiQuestion(localizedOpener);
      }
      setTranscript([
        {
          sender: 'ai',
          text: localizedOpener,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      // Speak greeting immediately and record in ref so useEffect doesn't duplicate it
      speakText(localizedOpener, newLangCode, () => {
        setTimeout(() => setAiMode('listening'), 400);
      });
    } else {
      // If turn > 1, speak confirmation line in chosen language and continue
      const confirmationMsg = newLangCode.startsWith('hi')
        ? 'हिन्दी भाषा सक्रिय की गई है। कृपया अपनी बात जारी रखें।'
        : newLangCode.startsWith('mr')
        ? 'मराठी भाषा सुरू केली आहे. कृपया पुढे बोला.'
        : 'Switched to English. Please continue.';

      speakText(confirmationMsg, newLangCode, () => {
        setTimeout(() => setAiMode('listening'), 400);
      });
    }
  };

  const cancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setCountdown(null);
  };

  const startCountdown = (seconds: number = 3) => {
    cancelCountdown();
    countdownValRef.current = seconds;
    setCountdown(seconds);

    countdownTimerRef.current = setInterval(() => {
      countdownValRef.current -= 1;
      if (countdownValRef.current <= 0) {
        cancelCountdown();
        const textToSubmit = (userInputRef.current || userInput).trim();
        console.log('[MindCare Auto-Send] Countdown expired, submitting:', textToSubmit);
        if (textToSubmit && !hasSubmittedRef.current) {
          handleSendAnswer(textToSubmit);
        }
      } else {
        setCountdown(countdownValRef.current);
      }
    }, 1000);
  };

  // Web Speech Synthesis — fires when a new AI question arrives
  useEffect(() => {
    if (!currentAiQuestion) return;

    // Avoid duplicate speak if already spoken or currently speaking this exact question
    if (lastSpokenTextRef.current === currentAiQuestion && (aiMode === 'speaking' || transcript.some((t) => t.text === currentAiQuestion))) {
      return;
    }

    cancelCountdown();
    hasSubmittedRef.current = false;
    sessionPrefixRef.current = '';
    userInputRef.current = '';
    isManuallyEditedRef.current = false;
    setUserInput('');
    setInterimDisplay('');

    // Avoid duplicate assistant entries in transcript
    setTranscript((prev) => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.sender === 'ai' && lastMsg.text === currentAiQuestion) {
        return prev;
      }
      return [
        ...prev,
        {
          sender: 'ai',
          text: currentAiQuestion,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });

    const finishSpeaking = () => {
      if (interviewComplete) {
        showToast('Assessment Completed!');
        // Allow user 2.2 seconds to absorb the warm closing words before transition
        setTimeout(() => {
          setScreen('completed');
        }, 2200);
      } else {
        // 600ms acoustic buffer allows speaker playback to clear so TTS audio doesn't bleed into mic
        setTimeout(() => {
          setAiMode('listening');
        }, 600);
      }
    };

    speakText(currentAiQuestion, selectedLang, finishSpeaking);

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    };
  }, [currentAiQuestion, selectedLang]);

  const handleReplayQuestion = (customText?: string) => {
    const textToPlay = customText || currentAiQuestion;
    if (!textToPlay) return;
    cancelCountdown();
    speakText(textToPlay, selectedLang, () => {
      setTimeout(() => setAiMode('listening'), 600);
    });
  };

  const handleSkipAiSpeech = () => {
    isSpeakingRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setTimeout(() => setAiMode('listening'), 200);
  };

  // Continuous Speech-to-Text (STT) Engine with Active Language Support, Smart Merging & Robust Auto-Recovery
  useEffect(() => {
    if (micMuted || aiMode !== 'listening') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
      setIsListening(false);
      cancelCountdown();
      return;
    }

    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      // Cleanly abort previous recognizer before instantiating new one
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = selectedLang;

      let isStopping = false;
      let restartTimer: ReturnType<typeof setTimeout> | null = null;
      recognitionRef.current = recognition;

      console.log('[MindCare STT] High-fidelity engine active. Listening for language:', selectedLang);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const segment = res[0]?.transcript || '';
          // Filter out low-confidence acoustic fragments if confidence is available
          if (res.isFinal) {
            sessionFinal += (sessionFinal ? ' ' : '') + segment.trim();
          } else {
            sessionInterim += (sessionInterim ? ' ' : '') + segment.trim();
          }
        }

        sessionFinal = sessionFinal.trim();
        sessionInterim = sessionInterim.trim();

        // Calculate spoken text in active session, giving priority to confirmed final words
        const currentSpoken = (sessionFinal + (sessionFinal && sessionInterim ? ' ' : '') + sessionInterim).trim();
        const prefix = sessionPrefixRef.current.trim();

        let fullDisplay = '';
        if (!prefix) {
          fullDisplay = currentSpoken;
        } else if (!currentSpoken) {
          fullDisplay = prefix;
        } else if (currentSpoken.toLowerCase().startsWith(prefix.toLowerCase())) {
          // Prevent text duplication if engine returns full sentence context
          fullDisplay = currentSpoken;
        } else {
          fullDisplay = `${prefix} ${currentSpoken}`;
        }

        if (fullDisplay) {
          setInputValue(fullDisplay);
          setInterimDisplay(sessionInterim);
        }

        // Voice activity detected: cancel any pending silence timers/countdowns while user speaks
        cancelCountdown();

        // Schedule responsive auto-send after 1.4s of calm pause
        if (autoSubmit && fullDisplay.trim().length >= 1) {
          silenceTimerRef.current = setTimeout(() => {
            const currentVal = (userInputRef.current || fullDisplay).trim();
            if (currentVal && !hasSubmittedRef.current && aiMode === 'listening') {
              console.log('[MindCare Auto-Send] Pause detected, initiating countdown for:', currentVal);
              startCountdown(2);
            }
          }, 1400);
        }
      };

      recognition.onerror = (err: any) => {
        const errType = err?.error;
        if (errType === 'no-speech' || errType === 'aborted') {
          return;
        }
        console.warn('[MindCare STT] Recognition error:', errType);
        if (errType === 'network' && !isStopping && !micMuted && aiMode === 'listening') {
          setTimeout(() => {
            if (!isStopping && !micMuted && aiMode === 'listening') {
              try {
                recognition.start();
              } catch (e) {}
            }
          }, 300);
        }
      };

      recognition.onend = () => {
        const textNow = (userInputRef.current || userInput).trim();
        sessionPrefixRef.current = textNow;

        if (!isStopping && !micMuted && aiMode === 'listening' && !hasSubmittedRef.current) {
          // If user stopped speaking and speech session ended, initiate fast countdown if text present
          if (textNow && autoSubmit && countdownValRef.current <= 0) {
            console.log('[MindCare Auto-Send] Speech session ended, starting countdown for:', textNow);
            startCountdown(2);
          }

          // Safely restart recognition after short delay to prevent InvalidStateError in Chrome/Edge
          restartTimer = setTimeout(() => {
            if (!isStopping && !micMuted && aiMode === 'listening' && !hasSubmittedRef.current) {
              try {
                recognition.start();
                setIsListening(true);
              } catch (e) {
                console.warn('[MindCare STT] Safe restart notice, retrying engine...', e);
                setTimeout(() => {
                  if (!isStopping && !micMuted && aiMode === 'listening' && !hasSubmittedRef.current) {
                    try { recognition.start(); } catch (e2) {}
                  }
                }, 250);
              }
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.warn('[MindCare STT] Recognition initial start notice:', e);
      }

      return () => {
        isStopping = true;
        if (restartTimer) clearTimeout(restartTimer);
        try {
          recognition.abort();
        } catch (e) {}
        recognitionRef.current = null;
        cancelCountdown();
      };
    }
  }, [micMuted, currentAiQuestion, aiMode, selectedLang, autoSubmit]);

  const handleSendAnswer = (textToSend?: string) => {
    cancelCountdown();
    const finalAnswer = (textToSend !== undefined ? textToSend : (userInputRef.current || userInput)).trim();
    if (!finalAnswer || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    console.log('[MindCare STT] Committing answer to API:', finalAnswer, 'Language:', selectedLang);

    setTranscript((prev) => [
      ...prev,
      {
        sender: 'user',
        text: finalAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Send answer along with selected language to AppContext & API
    recordAnswer(finalAnswer, selectedLang);
    setInputValue('');
    setInterimDisplay('');
    sessionPrefixRef.current = '';
    isManuallyEditedRef.current = false;
    setAiMode('thinking');
  };

  const handleClearInput = () => {
    cancelCountdown();
    setInputValue('');
    setInterimDisplay('');
    sessionPrefixRef.current = '';
    isManuallyEditedRef.current = false;
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  const handlePreviewVoice = (e: React.MouseEvent, langCode: string) => {
    e.stopPropagation();
    const sampleText =
      langCode.startsWith('hi')
        ? 'नमस्ते! मैं सेज हूँ, आपकी क्लिनिकल साथी। मैं आपकी सहायता के लिए तैयार हूँ।'
        : langCode.startsWith('mr')
        ? 'नमस्कार! मी सेज आहे, तुमची क्लिनिकल सोबती. मी तुमच्याशी बोलायला तयार आहे.'
        : 'Hello! I am Sage, your clinical companion. I am ready to begin.';
    speakText(sampleText, langCode);
  };

  const handleStartConsultation = () => {
    try {
      // 1. Immediately cancel any running speech preview (e.g. from Listen Voice Sample)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (e) {}
      }
      isSpeakingRef.current = false;

      // 2. Persist chosen language in localStorage
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('mindcare_lang', selectedLang);
        } catch (e) {}
      }

      // 3. Build the clinical opener in the chosen language
      const opener = buildInterviewOpener(user?.fullName, selectedLang);

      // 4. Initialize interview in AppContext
      try {
        startInterview(selectedLang);
      } catch (err) {
        console.warn('Could not initialize interview context:', err);
      }

      // 5. Immediately seed transcript so chat is NEVER blank or stuck
      setTranscript([
        {
          sender: 'ai',
          text: opener,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      lastSpokenTextRef.current = opener;

      // 6. Transition to the main assessment consultation interface
      setHasSelectedLanguage(true);

      // 7. Speak opener with a safe 60ms delay (avoids Chromium cancel() queue lock)
      setTimeout(() => {
        try {
          speakText(opener, selectedLang, () => {
            setTimeout(() => {
              setAiMode('listening');
            }, 500);
          });
        } catch (e) {
          console.warn('TTS speech failed:', e);
          setAiMode('listening');
        }
      }, 60);
    } catch (outerErr) {
      console.error('Error starting consultation:', outerErr);
      // Guarantee transition to consultation interface even if unexpected error occurs
      setHasSelectedLanguage(true);
    }
  };

  if (!hasSelectedLanguage) {
    const activeLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];
    return (
      <div className="w-full h-full min-h-0 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 text-slate-900 flex flex-col justify-center space-y-6">
          {/* 4-Stage Assessment Stepper */}
          <AssessmentStepper currentScreen="assessment" onNavigate={(scr) => setScreen(scr)} />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl space-y-6 sm:space-y-8 relative overflow-hidden backdrop-blur-sm"
          >
            {/* Subtle Top Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" />

            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold tracking-wide uppercase shadow-2xs">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>Multilingual Consultation Setup · Stage 2</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Choose Your Preferred Language
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
                Sage AI Companion conducts in-depth clinical psychiatric dialogues natively in English, Hindi, and Marathi with high-fidelity speech synthesis.
              </p>
            </div>

            {/* 3 Interactive Language Option Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <div
                    key={lang.code}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedLang(lang.code)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedLang(lang.code);
                      }
                    }}
                    className={`p-5 sm:p-6 rounded-2xl border-2 text-left flex flex-col justify-between gap-3.5 transition-all relative overflow-hidden cursor-pointer select-none ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-lg shadow-teal-600/10 scale-[1.01] ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl sm:text-4xl filter drop-shadow-sm">{lang.flag}</span>
                      {isSelected ? (
                        <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-xs">
                          ○
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">{lang.nativeLabel}</h3>
                      <p className="text-xs font-bold text-teal-700">{lang.name}</p>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{lang.hint}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <div className="text-[11px] font-medium text-teal-800 bg-white border border-teal-100 px-2.5 py-1 rounded-xl truncate shadow-2xs">
                        Preview: "{buildInterviewOpener(user?.fullName, lang.code).slice(0, 32)}..."
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handlePreviewVoice(e, lang.code)}
                          className="flex-1 text-[11px] font-bold text-slate-600 hover:text-teal-700 hover:bg-teal-50 py-1.5 px-2 rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Voice Sample</span>
                        </button>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartConsultation();
                            }}
                            className="text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white py-1.5 px-2.5 rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                            title="Continue directly with this language"
                          >
                            <span>Start</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Start Consultation Action Button */}
            <div className="flex flex-col items-center gap-2.5 pt-2">
              <button
                type="button"
                id="btn-start-consultation"
                onClick={handleStartConsultation}
                className="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98] text-white font-black text-base shadow-lg shadow-teal-600/25 hover:shadow-teal-600/40 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-teal-200" />
                <span>
                  Start Consultation in {activeLangInfo.nativeLabel}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-slate-400 text-center">
                You can seamlessly switch your consultation language anytime during the dialogue.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-2 text-slate-900 flex flex-col gap-2 h-full max-h-[calc(100vh-65px)] min-h-0 overflow-hidden">
      {/* TOP HEADER: Active Consultation Timer + Stepper Progress + 3-Language Segmented Switcher */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2.5 bg-white border border-slate-200/90 px-3 sm:px-5 py-2 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          {/* Active Consultation Live Timer with 5-Minute Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 shadow-2xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${interviewDurationSec >= 300 ? 'bg-emerald-400' : 'bg-teal-400 animate-ping'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${interviewDurationSec >= 300 ? 'bg-emerald-600' : 'bg-teal-500'}`}></span>
            </span>
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="text-xs font-mono font-black tracking-tight text-teal-900">
              {formatDuration(interviewDurationSec)} <span className="text-slate-400 font-normal">/ 05:00</span>
            </span>
            {interviewDurationSec >= 300 ? (
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                5m Reached
              </span>
            ) : interviewDurationSec >= 240 ? (
              <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md animate-pulse">
                Final Min
              </span>
            ) : null}
          </div>

          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Interactive Consultation</span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 hidden sm:inline-block">
                Multimodal AI
              </span>
            </h1>
          </div>
        </div>

        {/* Dynamic Consultation Status Badge & Clinical Domain Tracker */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-teal-50/80 border-teal-200 text-teal-900 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-extrabold text-teal-800">Stage 2: Consultation</span>
            <span className="text-teal-300">•</span>
            <span className="font-medium text-teal-700 truncate max-w-[260px]">
              Domain {Math.min(Math.max(1, interviewTurnNumber), CLINICAL_DOMAINS_MAP.length)}/8: {CLINICAL_DOMAINS_MAP[Math.min(Math.max(0, interviewTurnNumber - 1), CLINICAL_DOMAINS_MAP.length - 1)]}
            </span>
          </div>
          {/* Mini Clinical Progress Bar */}
          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0 shadow-inner" title={`Assessment Progress: ${Math.min(100, Math.round((interviewTurnNumber / 8) * 100))}%`}>
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(12, (interviewTurnNumber / 8) * 100))}%` }}
            />
          </div>
        </div>

        {/* PROMINENT 3-LANGUAGE SEGMENTED SWITCHER */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/90 shadow-2xs">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs shadow-teal-600/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title={lang.hint}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeLabel}</span>
                {isSelected && <Check className="w-3 h-3 text-teal-200 shrink-0 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Layout: Main Chat on Left (Wide Hero), Compact Camera Preview on Right (Fixed Box) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_330px] xl:grid-cols-[1fr_350px] gap-2.5 min-h-0 overflow-hidden">
        {/* LEFT / CENTER COLUMN: The Primary Chat Conversation Area */}
        <div className="flex flex-col gap-2 min-w-0 h-full overflow-hidden">
          {/* Active Question Banner & Sage Voice Status */}
          <div className="shrink-0 bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <AiVoiceOrb mode={aiMode} size="xs" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-teal-700">
                    Sage Clinical Companion
                  </span>
                  <span className="text-[9px] bg-teal-50 border border-teal-200 text-teal-700 px-1.5 py-0.2 rounded-full font-bold">
                    {currentLangObj.flag} {currentLangObj.nativeLabel}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {aiMode === 'speaking'
                    ? selectedLang.startsWith('hi')
                      ? 'सेज हिन्दी में बोल रही है...'
                      : selectedLang.startsWith('mr')
                      ? 'सेज मराठीत बोलत आहे...'
                      : 'Sage is speaking aloud in English...'
                    : isListening && !micMuted
                    ? selectedLang.startsWith('hi')
                      ? '🎙️ सेज आपकी बात सुन रही है... (बोलें)'
                      : selectedLang.startsWith('mr')
                      ? '🎙️ सेज तुमचे बोलणे ऐकत आहे... (बोला)'
                      : `🎙️ Listening... Speak naturally`
                    : aiMode === 'thinking'
                    ? selectedLang.startsWith('hi')
                      ? 'सेज सोच रही है...'
                      : selectedLang.startsWith('mr')
                      ? 'सेज विचार करत आहे...'
                      : 'Sage is analyzing with Groq...'
                    : 'Microphone is paused'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Auto-Scroll Toggle Button */}
              <button
                type="button"
                onClick={toggleAutoScroll}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs ${
                  autoScroll
                    ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                }`}
                title={autoScroll ? 'Auto-scroll is ON. Click to pause auto-scrolling.' : 'Auto-scroll is PAUSED. Click to turn ON.'}
              >
                <span className={`w-2 h-2 rounded-full ${autoScroll ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="hidden sm:inline">Auto-Scroll</span>
                <span className="text-[10px] font-black">{autoScroll ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleReplayQuestion()}
                className="p-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
                title="Repeat active question aloud"
              >
                <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Repeat</span>
              </button>

              {aiMode === 'speaking' && (
                <button
                  type="button"
                  onClick={handleSkipAiSpeech}
                  className="p-1.5 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-bold transition-all flex items-center gap-1"
                  title="Skip voice and jump straight to answering"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => concludeInterview()}
                className={`p-1.5 px-3 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 ${
                  interviewComplete || interviewDurationSec >= 300
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400 ring-offset-1 animate-pulse'
                    : interviewTurnNumber >= 3 || interviewDurationSec >= 120
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
                title="Conclude assessment and review full report"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>
                  {interviewComplete || interviewDurationSec >= 300
                    ? 'Review Report ➔'
                    : interviewTurnNumber >= 3
                    ? 'Conclude'
                    : 'Wrap Up'}
                </span>
              </button>
            </div>
          </div>

          {/* Chat Messages History Window with Floating Auto-Scroll Button */}
          <div className="relative flex-1 min-h-0 flex flex-col">
            <div
              ref={chatContainerRef}
              onScroll={handleChatScroll}
              className="flex-1 min-h-0 bg-gradient-to-b from-slate-50/80 to-white/90 border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-inner overflow-y-auto flex flex-col gap-3 scroll-smooth"
            >
              {transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2.5 my-auto">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-2xs">
                    <Bot className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Starting consultation with Sage...</p>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    You can speak naturally or type your responses in English, Hindi (हिन्दी), or Marathi (मराठी).
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-teal-700 bg-teal-50/70 px-3 py-1 rounded-full border border-teal-100 mt-1">
                    <Shield className="w-3.5 h-3.5 text-teal-600" />
                    <span>Encrypted Client-Side Clinical Telemetry</span>
                  </div>
                </div>
              ) : (
                transcript.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Sender Avatar */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        msg.sender === 'ai'
                          ? 'bg-gradient-to-tr from-teal-600 to-cyan-500 text-white'
                          : 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white'
                      }`}
                    >
                      {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Message Card */}
                    <div
                      className={`rounded-2xl p-3 sm:p-3.5 text-sm shadow-xs transition-all relative ${
                        msg.sender === 'ai'
                          ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm'
                          : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-tr-sm shadow-teal-600/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] mb-1 opacity-75">
                        <span className="font-bold flex items-center gap-1.5">
                          {msg.sender === 'ai' ? 'MindCare AI · Sage' : user?.fullName || 'You'}
                          {msg.sender === 'ai' && (
                            <span className="text-[9px] bg-slate-100 text-teal-700 px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                              {currentLangObj.flag} Clinician
                            </span>
                          )}
                        </span>
                        <span>{msg.time}</span>
                      </div>

                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* Audio Replay for Sage */}
                      {msg.sender === 'ai' && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-teal-500" />
                            Clinical Inquiry
                          </span>
                          <button
                            type="button"
                            onClick={() => handleReplayQuestion(msg.text)}
                            className="text-[11px] font-bold text-slate-500 hover:text-teal-700 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-slate-50"
                            title="Listen to this question aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>Listen</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {/* Live Streaming Response Card */}
              {streamingAiText && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 max-w-[88%] mr-auto"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm p-3 sm:p-3.5 text-sm shadow-sm bg-white border border-teal-300 text-slate-800 relative">
                    <div className="flex items-center justify-between gap-3 text-[11px] mb-1 opacity-75">
                      <span className="font-bold flex items-center gap-1.5 text-teal-700">
                        MindCare AI · Sage
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      </span>
                      <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        Live Streaming...
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap text-slate-800">
                      {streamingAiText}
                      <span className="inline-block w-1.5 h-4 ml-1 bg-teal-600 animate-pulse align-middle" />
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Live User Voice Interim Preview Bubble */}
              {isListening && interimDisplay && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 max-w-[88%] ml-auto flex-row-reverse"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="rounded-2xl rounded-tr-sm p-3 text-sm shadow-xs bg-teal-50 border border-teal-200 text-teal-900 relative">
                    <div className="flex items-center justify-between gap-3 text-[11px] mb-1 opacity-75">
                      <span className="font-bold flex items-center gap-1.5 text-teal-800">
                        <span>You (Speaking)</span>
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      </span>
                      <span className="text-[10px] font-semibold text-teal-700">Listening...</span>
                    </div>
                    <p className="leading-relaxed italic text-teal-950 font-medium">{interimDisplay}</p>
                  </div>
                </motion.div>
              )}

              {/* Live Typing / Thinking Indicator */}
              {aiMode === 'thinking' && !streamingAiText && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 mr-auto max-w-[80%]"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm shrink-0">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-2.5 sm:p-3 shadow-xs flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      {selectedLang.startsWith('hi')
                        ? 'सेज जवाब तैयार कर रही है'
                        : selectedLang.startsWith('mr')
                        ? 'सेज विचार करत आहे'
                        : 'Sage is formulating clinical response'}
                    </span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Empathetic 5-Minute Interview Completion Card */}
              {(interviewComplete || interviewDurationSec >= 300) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mx-auto my-3 w-full max-w-lg p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 shadow-lg text-center space-y-3"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {selectedLang.startsWith('hi')
                        ? 'परामर्श सफलतापूर्वक पूर्ण हुआ'
                        : selectedLang.startsWith('mr')
                        ? 'सल्ला यशस्वीरीत्या पूर्ण झाला'
                        : 'Consultation Complete'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {selectedLang.startsWith('hi')
                        ? 'इतनी ईमानदारी और साहस के साथ अपने विचार साझा करने के लिए धन्यवाद। आपका क्लिनिकल मूल्यांकन और विस्तृत रिपोर्ट तैयार है।'
                        : selectedLang.startsWith('mr')
                        ? 'मोकळेपणाने आणि धैर्याने तुमचे विचार मांडल्याबद्दल धन्यवाद. तुमचे क्लिनिकल मूल्यमापन आणि तपशीलवार अहवाल तयार आहे.'
                        : 'Thank you for taking this time and sharing your thoughts so openly. Your comprehensive clinical analysis and personalized wellness plan are ready.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => concludeInterview()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>
                      {selectedLang.startsWith('hi')
                        ? 'विस्तृत रिपोर्ट देखें'
                        : selectedLang.startsWith('mr')
                        ? 'सविस्तर अहवाल पहा'
                        : 'View Clinical Assessment Report'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Jump to Latest Message Button */}
            <AnimatePresence>
              {isUserScrolledUp && (
                <motion.button
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.9 }}
                  type="button"
                  onClick={() => {
                    setAutoScroll(true);
                    scrollToBottom('smooth');
                  }}
                  className="absolute bottom-3 right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition-all hover:scale-105 cursor-pointer border border-teal-500/50"
                  title="Scroll to latest message"
                >
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>Latest Message</span>
                  {newMessagesWhileScrolled > 0 && (
                    <span className="w-5 h-5 rounded-full bg-white text-teal-700 text-[10px] font-black flex items-center justify-center shadow-xs">
                      +{newMessagesWhileScrolled}
                    </span>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Quick-Response Suggestion Chips */}
          <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 shrink-0 mr-1">
              Suggestions:
            </span>
            {currentLangObj.quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputValue(chip);
                  sessionPrefixRef.current = chip;
                  isManuallyEditedRef.current = true;
                  cancelCountdown();
                  if (autoSubmit) {
                    silenceTimerRef.current = setTimeout(() => {
                      startCountdown(2);
                    }, 1800);
                  }
                }}
                className="text-xs shrink-0 px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-800 text-slate-700 transition-all shadow-2xs cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Response Studio: Live Speech Input, Auto-Send, Send & Clear */}
          <div className="shrink-0 bg-white border border-slate-200/90 p-2.5 sm:p-3.5 rounded-2xl shadow-xs flex flex-col gap-2">
            {/* Countdown Banner if auto-send silence detected */}
            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold shadow-2xs overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                    <span>
                      Pause detected. Auto-sending in{' '}
                      <strong className="text-teal-700 text-sm">{countdown}s</strong>...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        cancelCountdown();
                        setAutoSubmit(false);
                        showToast('Auto-send paused — take your time!');
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-white border border-teal-300 text-teal-700 hover:bg-teal-100 text-xs font-bold transition-all"
                    >
                      Keep Editing
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAnswer(userInputRef.current || userInput)}
                      className="px-2.5 py-0.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Send Now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {interviewComplete ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-teal-900/10 border border-teal-400/30">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
                    <Check className="w-6 h-6 stroke-[3] text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base">
                      {selectedLang.startsWith('hi')
                        ? 'परामर्श समाप्त · मूल्यांकन तैयार है'
                        : selectedLang.startsWith('mr')
                        ? 'सल्ला संपन्न · मूल्यमापन तयार आहे'
                        : 'Consultation Concluded · Assessment Ready'}
                    </h4>
                    <p className="text-xs text-teal-100">
                      {selectedLang.startsWith('hi')
                        ? 'विस्तृत रिपोर्ट देखने के लिए यहाँ क्लिक करें।'
                        : selectedLang.startsWith('mr')
                        ? 'तपशीलवार अहवाल पाहण्यासाठी येथे क्लिक करा.'
                        : 'Click below to review your comprehensive clinical report.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => concludeInterview()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all shrink-0 hover:scale-[1.02] cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>
                    {selectedLang.startsWith('hi')
                      ? 'रिपोर्ट देखें'
                      : selectedLang.startsWith('mr')
                      ? 'अहवाल पहा'
                      : 'Review Clinical Report'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-800" />
                </button>
              </div>
            ) : (
              <>
                {/* Editable Text Area with Live Word Streaming */}
                <div className="relative rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition-all p-2.5 flex flex-col min-h-[75px]">
                  <textarea
                    value={userInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputValue(val);
                      sessionPrefixRef.current = val;
                      isManuallyEditedRef.current = true;
                      cancelCountdown();
                      if (autoSubmit && val.trim().length >= 1) {
                        silenceTimerRef.current = setTimeout(() => {
                          startCountdown(3);
                        }, 2500);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAnswer(userInputRef.current || userInput);
                      }
                    }}
                    rows={2}
                    placeholder={currentLangObj.placeholder}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Bottom info row inside textarea */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 mt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isListening && !micMuted && (
                        <span className="text-teal-700 font-semibold flex items-center gap-1.5 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                          Live Speech ({currentLangObj.flag} {currentLangObj.nativeLabel})
                        </span>
                      )}
                      {isManuallyEditedRef.current && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                          Keyboard input
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">Enter ↵</kbd> to send
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Auto-Send Toggle, Send & Clear */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        cancelCountdown();
                        setAutoSubmit((prev) => {
                          showToast(prev ? 'Manual mode: click Send or press Enter' : 'Auto-send enabled: sends after pause');
                          return !prev;
                        });
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                        autoSubmit
                          ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                          : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                      }`}
                      title={
                        autoSubmit
                          ? 'Automatically sends response after a natural pause. Click to switch to manual send.'
                          : 'Manual send: takes as much time as you need. Click to send.'
                      }
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{autoSubmit ? 'Auto-Send: ON' : 'Manual Mode'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {userInput.trim() && (
                      <button
                        type="button"
                        onClick={handleClearInput}
                        className="p-1.5 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Clear text to re-speak"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>{selectedLang.startsWith('hi') ? 'हटाएं' : selectedLang.startsWith('mr') ? 'साफ करा' : 'Clear'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSendAnswer(userInput)}
                      disabled={!userInput.trim() || aiMode === 'thinking'}
                      className={`p-2 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                        userInput.trim() && aiMode !== 'thinking'
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {selectedLang.startsWith('hi')
                          ? 'उत्तर भेजें'
                          : selectedLang.startsWith('mr')
                          ? 'उत्तर पाठवा'
                          : 'Send Answer'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Compact Fixed-Size Camera Preview & Telemetry Panel (Non-scrolling camera view) */}
        <div className="flex flex-col gap-2 shrink-0 w-full lg:w-[330px] xl:w-[350px] h-full overflow-y-auto scrollbar-none">
          {/* COMPACT WEBCAM BOX: Fixed aspect ratio, NEVER stretches vertically when chat grows! */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-teal-600" />
                Live Face Biometrics
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Edge AI
              </span>
            </div>

            {/* FIXED COMPACT WEBCAM FRAME */}
            <div className="relative w-full aspect-[4/3] max-h-[190px] rounded-xl overflow-hidden border border-teal-500/30 bg-slate-950 shadow-xs">
              <CameraPreview
                cameraOn={cameraOn}
                onToggleCamera={toggleCamera}
                backgroundBlur={backgroundBlur}
                onToggleBlur={toggleBackgroundBlur}
                isFullScreen={isFullScreenVideo}
                onToggleFullScreen={() => setIsFullScreenVideo((prev) => !prev)}
                onEmotionReading={recordFaceEmotion}
              />
            </div>

            {/* Camera & Mic Quick Hardware Bar */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                    !cameraOn
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                  title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  {!cameraOn ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{cameraOn ? 'On' : 'Off'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                    micMuted
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                  title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {micMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{micMuted ? 'Muted' : 'Mic On'}</span>
                </button>
              </div>

              {/* Mini Audio Spectrum */}
              <div className="flex-1 flex justify-end pl-2">
                <AudioVisualizer
                  isRecording={!micMuted}
                  barCount={10}
                  height={18}
                  isSpeaking={aiMode === 'speaking' || (isListening && !micMuted)}
                />
              </div>
            </div>
          </div>

          {/* Real-time Facial Expression Telemetry */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Smile className="w-3.5 h-3.5 text-teal-600" />
                <span>Detected Facial Affect</span>
              </div>
              <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                face-api.js
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-teal-900 capitalize">
                  {currentFaceEmotion?.dominantEmotion || 'Calm & Attentive'}
                </p>
                <p className="text-[10px] text-teal-700 font-medium">Real-time landmark analysis</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-teal-700">
                  {currentFaceEmotion?.confidence ? `${Math.round(currentFaceEmotion.confidence * 100)}%` : '96%'}
                </span>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Confidence</p>
              </div>
            </div>
          </div>

          {/* Active Multilingual Status Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Multilingual Dialogue Engine</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Active Language:</span>
                <span className="font-bold text-teal-700">
                  {currentLangObj.flag} {currentLangObj.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">AI Engine:</span>
                <span className="font-semibold text-slate-800">Groq LPU (Qwen 3.8 27B)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Voice Audio:</span>
                <span className="font-semibold text-emerald-700">SpeechSynthesis Native</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Switch languages anytime above between <strong>English</strong>, <strong>हिन्दी</strong>, and <strong>मराठी</strong>. Sage adapts voice and dialogue instantly.
            </p>
          </div>

          {/* Session Termination Button */}
          <button
            type="button"
            onClick={() => concludeInterview()}
            className="w-full p-2.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 hover:border-rose-200 shadow-2xs transition-all mt-auto cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5 text-rose-500" />
            <span>End Consultation Early</span>
          </button>
        </div>
      </div>
    </div>
  );
};
