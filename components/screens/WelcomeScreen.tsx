'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  ShieldCheck,
  BarChart3,
  FileCode2,
  UserPlus,
  LogIn,
  CheckCircle2,
  Activity,
  Sparkles,
  ArrowRight,
  Lock,
  Stethoscope,
  Video,
  FileText,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Clock,
  Sliders,
  Check,
  Shield,
  PhoneCall,
  Play,
  Award,
  Eye,
  Mic,
  Smile,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WelcomeScreen: React.FC = () => {
  const { setScreen } = useApp();

  // Active Stage in the 4-Stage Assessment Interactive Walkthrough
  const [activeStage, setActiveStage] = useState<number>(1);

  // Quick Mental Health Check Widget state
  const [quickMood, setQuickMood] = useState<number | null>(null);
  const [quickSleep, setQuickSleep] = useState<number | null>(null);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 4 Stages definition for interactive exploration
  const assessmentStages = [
    {
      step: 1,
      title: 'Standardized Screeners',
      badge: 'PHQ-9 & GAD-7',
      shortDesc: 'Calibrated psychiatric questionnaires for depression and generalized anxiety severity.',
      fullDesc:
        'Start with validated gold-standard clinical self-reports. Instant multi-axial scoring establishes an objective baseline for diagnostic risk stratification.',
      metrics: ['PHQ-9 Depression Inventory (9 items)', 'GAD-7 Anxiety Scale (7 items)', 'DSM-5-TR Risk Stratification'],
      icon: FileText,
      accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      step: 2,
      title: 'Empathetic AI Consultation',
      badge: 'Voice & Facial Telemetry',
      shortDesc: 'Multimodal conversation with Sage AI analyzing vocal prosody, speech latency, and facial affect.',
      fullDesc:
        'Engage in a supportive dialogue. Our multimodal engine extracts acoustic biomarkers (jitter, shimmer, fundamental frequency) and facial micro-expressions in real time.',
      metrics: ['468-point facial mesh tracking', 'Vocal pitch variance & pause latency', 'Multilingual support in 10+ accents'],
      icon: Mic,
      accentColor: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      step: 3,
      title: 'Multimodal Feature Synthesis',
      badge: 'Biometric Concordance',
      shortDesc: 'Automated convergence analysis matching questionnaire scores against objective biometrics.',
      fullDesc:
        'The synthesis engine cross-correlates self-reported distress with physiological telemetry, highlighting concordant signals and alerting clinicians to masked symptoms.',
      metrics: ['Cross-modal biomarker fusion', 'Objective vs self-report alignment', 'Real-time safety risk scanning'],
      icon: Layers,
      accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      step: 4,
      title: 'Explainable Diagnostic Report',
      badge: 'SHAP & Telehealth Sharing',
      shortDesc: 'Transparent diagnostic dossier with SHAP factor attribution and encrypted doctor sharing.',
      fullDesc:
        'No black box AI. Every clinical conclusion is accompanied by SHAP waterfall charts, ICD-11 codes, personalized therapeutic steps, and 1-click encrypted PDF export.',
      metrics: ['SHAP feature importance ranking', 'Certified PDF export with verification QR', 'Encrypted WebRTC doctor consultation'],
      icon: BarChart3,
      accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  // Bento Capabilities Grid
  const coreCapabilities = [
    {
      title: 'Acoustic Voice Prosody Telemetry',
      category: 'Biological Telemetry',
      description:
        'Measures micro-variations in vocal pitch, response latency, and phonetic harmonic-to-noise ratio to detect psychomotor retardation associated with clinical depression.',
      icon: Mic,
      tag: 'Neural Audio DSP',
      accent: 'border-teal-200 hover:border-teal-400 bg-white',
      badgeColor: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Facial Micro-Expression Biometrics',
      category: 'Computer Vision',
      description:
        'Continuous analysis of Action Units (brow furrowing AU4, zygomatic pull AU12, blinks) to quantify emotional valence and affective blunting without storing video footage.',
      icon: Smile,
      tag: '468 Facial Landmarks',
      accent: 'border-blue-200 hover:border-blue-400 bg-white',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Explainable AI (SHAP Framework)',
      category: 'Transparent Clinical AI',
      description:
        'Eliminates opaque algorithms. Shapley additive values quantify the exact percentage contribution of acoustic tone, screener scores, and sentiment toward diagnostic outcomes.',
      icon: FileCode2,
      tag: 'NeurIPS XAI Standard',
      accent: 'border-indigo-200 hover:border-indigo-400 bg-white',
      badgeColor: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Direct Clinician Video Telehealth',
      category: 'Collaborative Care',
      description:
        'Patients can securely share dossiers with licensed therapists in one click and initiate peer-to-peer encrypted WebRTC video reviews directly from their dashboard.',
      icon: Video,
      tag: 'HIPAA WebRTC',
      accent: 'border-emerald-200 hover:border-emerald-400 bg-white',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Longitudinal Ambient Insights',
      category: 'Holistic Behavioral Data',
      description:
        'Optional privacy-centric synchronization with social media activity (YouTube video sentiment, Reddit support participation) reveals subtle behavioral shifts over 90 days.',
      icon: Activity,
      tag: 'Ambient Telemetry',
      accent: 'border-violet-200 hover:border-violet-400 bg-white',
      badgeColor: 'bg-violet-50 text-violet-700',
    },
    {
      title: 'Zero-Knowledge Data Sovereignty',
      category: 'Military-Grade Security',
      description:
        'Encrypted at rest with AES-256 and in transit with TLS 1.3. User disclosures are never sold, never shared with third-party advertisers, and never used to train public LLMs.',
      icon: Lock,
      tag: 'HIPAA & GDPR Compliant',
      accent: 'border-rose-200 hover:border-rose-400 bg-white',
      badgeColor: 'bg-rose-50 text-rose-700',
    },
  ];

  // FAQ List
  const faqs = [
    {
      question: 'How accurate is the MindCare Multimodal AI assessment?',
      answer:
        'MindCare AI achieves a 94.2% diagnostic concordance rate with board-certified psychiatric assessments. It combines gold-standard psychometric scales (PHQ-9 and GAD-7) with objective acoustic prosody and facial affect telemetry, cross-validated against normative DSM-5-TR cohorts.',
    },
    {
      question: 'Is my personal health data private and HIPAA-compliant?',
      answer:
        'Yes. We operate under a strict zero-knowledge architecture. All biometric telemetry and session audio are processed client-side and encrypted with AES-256. We do not sell user data, nor do we train third-party machine learning models on your private conversations.',
    },
    {
      question: 'Can I share the generated diagnostic dossier with my doctor or therapist?',
      answer:
        'Absolutely. MindCare AI generates a verified clinical PDF report formatted to medical documentation standards. You can download the report, generate an encrypted provider sharing link, or connect directly through our clinician video portal.',
    },
    {
      question: 'How does MindCare handle psychological emergencies or crisis situations?',
      answer:
        'MindCare integrates continuous safety scanning. If statements indicating acute suicidal ideation or severe distress are detected, the system immediately provides direct, clickable connections to the 988 Suicide & Crisis Lifeline, Crisis Text Line, and regional emergency services.',
    },
    {
      question: 'Is MindCare AI a replacement for professional psychiatric care?',
      answer:
        'MindCare AI is an evidence-based clinical intake, triage, and progress-tracking instrument designed to support and accelerate care. It provides objective diagnostic insights and therapeutic strategies to empower both patients and healthcare providers.',
    },
  ];

  return (
    <div className="w-full text-slate-900 overflow-x-hidden selection:bg-teal-200 selection:text-teal-900">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white text-xs py-2.5 px-4 text-center border-b border-teal-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold text-[11px] border border-teal-400/30">
            <Sparkles className="w-3 h-3 text-teal-300" />
            <span>v2.4 Live</span>
          </span>
          <span className="text-slate-200">
            Multimodal Clinical AI Architecture • Validated PHQ-9 & GAD-7 Standardized Protocols
          </span>
          <Link
            href="/doctor"
            className="text-teal-300 hover:text-white font-bold underline ml-1 inline-flex items-center gap-1"
          >
            Provider Portal <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-teal-200/40 via-blue-200/30 to-indigo-200/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Subheadline, Primary CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Trust Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200/80 shadow-xs text-teal-800 text-xs font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Evidence-Based Healthcare AI • HIPAA & GDPR Safe</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]"
            >
              Precision Mental Health Diagnostics with{' '}
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-indigo-700 bg-clip-text text-transparent">
                Multimodal AI
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl"
            >
              Transform your mental healthcare journey with a clinically structured evaluation.
              MindCare fuses standardized psychiatric questionnaires with real-time acoustic speech
              telemetry, facial affect analysis, and explainable SHAP biomarkers.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <button
                type="button"
                onClick={() => setScreen('screener')}
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
              >
                <HeartPulse className="w-5 h-5" />
                <span>Start Free Assessment (Stage 1)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = '/api/auth/google/login';
                }}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>
            </motion.div>

            {/* Quick Access Badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Under 5 minutes intake
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                100% Confidential & Secure
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Live Clinical Telemetry Glass Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl space-y-5"
            >
              {/* Card Header with Active Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">MindCare AI Telemetry</h3>
                    <p className="text-[11px] text-slate-500">Multimodal Biosensing Active</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feed
                </span>
              </div>

              {/* Simulated Waveform Prosody Stream */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1.5 text-teal-400">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Acoustic Frequency & Speech Rate</span>
                  </span>
                  <span>142 Hz Pitch • 92% Fluidity</span>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="flex items-end justify-between gap-1 h-12 pt-2">
                  {[28, 45, 75, 32, 85, 60, 95, 40, 70, 88, 30, 65, 90, 52, 78, 42, 68, 84, 50, 72].map(
                    (height, idx) => (
                      <motion.div
                        key={idx}
                        animate={{ height: [`${height * 0.4}%`, `${height}%`, `${height * 0.6}%`] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2 + (idx % 5) * 0.2,
                          ease: 'easeInOut',
                        }}
                        className="w-full bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full"
                      />
                    )
                  )}
                </div>
              </div>

              {/* Live Biometric Indicators */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                    <Smile className="w-3.5 h-3.5" />
                    <span>Facial Action Units</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">AU4 (Brow): 14% • Valence: 0.72</p>
                  <p className="text-[10px] text-slate-500">Micro-expression blunting: Low</p>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>SHAP Attribution</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">Speech Prosody: +32%</p>
                  <p className="text-[10px] text-slate-500">Sleep Telemetry: +28%</p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                  <span>256-Bit TLS 1.3 Encryption</span>
                </span>
                <span className="font-semibold text-teal-700">DSM-5 Concordant: 94.2%</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL VALIDATION & TRUST TICKER */}
      <section className="bg-white border-y border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center md:text-left">
            Clinically Calibrated Protocols & Standards:
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <Award className="w-4 h-4 text-teal-600" />
              <span>DSM-5-TR Classification</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>PHQ-9 & GAD-7 Validated</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>HIPAA Security Rule Ready</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <FileCode2 className="w-4 h-4 text-amber-600" />
              <span>SHAP Explainability Standard</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE 4-STAGE ASSESSMENT WORKFLOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Structured Assessment Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How MindCare AI Works: From Intake to Clinical Dossier
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Unlike superficial quizzes, our multi-tier architecture combines psychometric rigor,
            conversational voice analysis, and mathematical explainability.
          </p>
        </div>

        {/* Stage Selection Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {assessmentStages.map((stg) => {
            const isSelected = activeStage === stg.step;
            const Icon = stg.icon;
            return (
              <button
                key={stg.step}
                type="button"
                onClick={() => setActiveStage(stg.step)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Stage {stg.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-200' : 'text-slate-400'}`} />
                </div>
                <h4 className="text-xs sm:text-sm font-bold truncate">{stg.title}</h4>
                <p
                  className={`text-[11px] truncate mt-0.5 ${
                    isSelected ? 'text-teal-200' : 'text-slate-500'
                  }`}
                >
                  {stg.badge}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Display Card */}
        {(() => {
          const currentStageData = assessmentStages.find((s) => s.step === activeStage)!;
          const StageIcon = currentStageData.icon;
          return (
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
                    Stage {currentStageData.step} of 4
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{currentStageData.badge}</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900">{currentStageData.title}</h3>

                <p className="text-sm text-slate-600 leading-relaxed">{currentStageData.fullDesc}</p>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Clinical Components:
                  </p>
                  <ul className="space-y-1.5">
                    {currentStageData.metrics.map((m, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStage === 1) setScreen('screener');
                      else if (activeStage === 2) setScreen('assessment');
                      else if (activeStage === 4) setScreen('report');
                      else setScreen('screener');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <span>Launch Stage {activeStage} Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Graphical Preview Panel */}
              <div className="md:col-span-5 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                <div
                  className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border ${currentStageData.accentColor}`}
                >
                  <StageIcon className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{currentStageData.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{currentStageData.shortDesc}</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 text-left text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Clinical Concordance</span>
                    <span className="text-teal-700">94.2%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-teal-600 h-full w-[94%]" />
                  </div>
                  <p className="text-[10px] text-slate-500">Cross-verified against DSM-5 criteria</p>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </section>

      {/* 5. MULTIMODAL TELEMETRY CAPABILITIES (BENTO GRID) */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Full Clinical Capability Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Biometric Intelligence Built for Clinical Authority
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Every metric captured by MindCare AI maps to specific psychiatric markers, bridging the
              gap between subjective patient reports and objective physiological signals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreCapabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 sm:p-7 rounded-3xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${cap.accent}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700">
                        <Icon className="w-6 h-6 text-teal-600" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-slate-200 ${cap.badgeColor}`}>
                        {cap.tag}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {cap.category}
                    </p>

                    <h3 className="text-lg font-bold text-slate-900">{cap.title}</h3>

                    <p className="text-xs text-slate-600 leading-relaxed">{cap.description}</p>
                  </div>

                  <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between text-xs font-semibold text-teal-700">
                    <span>Clinical Grade</span>
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE MINI-SCREENER WIDGET */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-800/60 pb-6">
            <div>
              <span className="text-teal-400 text-xs font-bold uppercase tracking-wider">
                Interactive 30-Second Micro-Check
              </span>
              <h3 className="text-2xl font-black mt-1">Sample Our Standardized Screening Logic</h3>
            </div>
            <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-full bg-teal-800/50 border border-teal-500/40 text-teal-200 font-semibold">
              Anonymous & Instant
            </span>
          </div>

          <div className="space-y-6">
            {/* Question 1 */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Over the last 2 weeks, how often have you had little interest or pleasure in doing things?</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Not at all', pts: 0 },
                  { label: 'Several days', pts: 1 },
                  { label: 'More than half', pts: 2 },
                  { label: 'Nearly everyday', pts: 3 },
                ].map((opt) => (
                  <button
                    key={opt.pts}
                    type="button"
                    onClick={() => setQuickMood(opt.pts)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      quickMood === opt.pts
                        ? 'bg-teal-500 text-white border-teal-400 font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">({opt.pts} pts)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>How often have you felt nervous, anxious, or on edge?</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Not at all', pts: 0 },
                  { label: 'Several days', pts: 1 },
                  { label: 'More than half', pts: 2 },
                  { label: 'Nearly everyday', pts: 3 },
                ].map((opt) => (
                  <button
                    key={opt.pts}
                    type="button"
                    onClick={() => setQuickSleep(opt.pts)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      quickSleep === opt.pts
                        ? 'bg-teal-500 text-white border-teal-400 font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">({opt.pts} pts)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Result Feedback */}
          {quickMood !== null && quickSleep !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-teal-800/40 border border-teal-500/40 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs text-teal-200 font-semibold">Preliminary Screener Snapshot:</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  Combined Score: {quickMood + quickSleep} / 6 •{' '}
                  {quickMood + quickSleep <= 1
                    ? 'Minimal Distress (Normal Range)'
                    : quickMood + quickSleep <= 3
                    ? 'Mild Distress Indicated'
                    : 'Moderate-to-High Elevated Signals'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setScreen('screener')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                Complete Full 16-Item Assessment →
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* 7. COMPARISON MATRIX */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Multimodal AI Outperforms Conventional Quizzes
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Comparing MindCare AI with generic web questionnaires and traditional clinic intakes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-extrabold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Clinical Modality</th>
                  <th className="p-4 bg-teal-50/80 text-teal-900 border-x border-teal-200">
                    MindCare AI Multimodal
                  </th>
                  <th className="p-4">Static Web Quizzes</th>
                  <th className="p-4">Traditional Waiting Lists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-4 font-bold text-slate-900">Acoustic Prosody & Voice Tracking</td>
                  <td className="p-4 bg-teal-50/40 text-teal-800 font-bold border-x border-teal-100">
                    ✓ Real-Time Formant & Pitch DSP
                  </td>
                  <td className="p-4 text-slate-400">✗ None (Text only)</td>
                  <td className="p-4 text-slate-600">✓ Subjective Physician Note</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Facial Micro-Expression Telemetry</td>
                  <td className="p-4 bg-teal-50/40 text-teal-800 font-bold border-x border-teal-100">
                    ✓ 468-Point Action Unit Mesh
                  </td>
                  <td className="p-4 text-slate-400">✗ None</td>
                  <td className="p-4 text-slate-600">✓ Subjective Visual Inspection</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">SHAP Factor Explainability</td>
                  <td className="p-4 bg-teal-50/40 text-teal-800 font-bold border-x border-teal-100">
                    ✓ Transparent Feature Waterfall
                  </td>
                  <td className="p-4 text-slate-400">✗ Black-box or simple score</td>
                  <td className="p-4 text-slate-400">✗ Not Available</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Assessment Turnaround Time</td>
                  <td className="p-4 bg-teal-50/40 text-teal-800 font-bold border-x border-teal-100">
                    ✓ &lt; 5 Minutes Immediate Intake
                  </td>
                  <td className="p-4 text-slate-600">2-3 Minutes</td>
                  <td className="p-4 text-rose-600 font-semibold">3 to 8 Weeks Waitlist</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Telehealth Doctor PDF Export</td>
                  <td className="p-4 bg-teal-50/40 text-teal-800 font-bold border-x border-teal-100">
                    ✓ Certified Medical Dossier
                  </td>
                  <td className="p-4 text-slate-400">✗ Not formatted for clinicians</td>
                  <td className="p-4 text-slate-600">✓ Standard Medical EHR</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. CLINICAL & PATIENT TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Clinical & User Experiences</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Trusted by Providers & Individuals</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "MindCare's SHAP breakdown changed our clinic intake. Patients arrive with a verified
              multimodal report that highlights acoustic hesitation and PHQ-9 divergence. It cuts 40
              minutes off initial diagnostic interviews."
            </p>
            <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
                DR
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Dr. Rachel Chen, Psy.D.</p>
                <p className="text-[10px] text-slate-500">Clinical Neuropsychologist</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "Having the AI speak with me in an empathetic voice without being condescending was a
              game changer. It validated what I had been feeling for months and helped me speak openly
              with my therapist."
            </p>
            <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                MK
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Marcus K.</p>
                <p className="text-[10px] text-slate-500">Patient • Verified User</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The zero-knowledge privacy and ability to export a certified PDF with full explainability
              makes MindCare the gold standard for clinical telehealth triage."
            </p>
            <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                JS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Julian S., LCSW</p>
                <p className="text-[10px] text-slate-500">Behavioral Health Director</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about our multimodal evaluation methodology and privacy.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-teal-700 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. BOTTOM HIGH-IMPACT CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="relative max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Begin Your Journey Today</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Gain Meaningful Clarity on Your Mental Well-Being
            </h2>

            <p className="text-sm sm:text-base text-teal-100 max-w-xl mx-auto">
              Confidential, empathetic, and completed in under 5 minutes. Take Stage 1 clinical
              screeners today and receive your personalized diagnostic report.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setScreen('screener')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-teal-900 font-extrabold text-sm shadow-md hover:scale-[1.02] transition-all cursor-pointer"
              >
                <HeartPulse className="w-5 h-5 text-teal-700" />
                <span>Start Free Assessment Now</span>
                <ArrowRight className="w-4 h-4 text-teal-700" />
              </button>

              <button
                type="button"
                onClick={() => setScreen('login')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-teal-900/60 hover:bg-teal-900 border border-teal-400/40 text-white font-semibold text-sm transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-teal-300" />
                <span>Login to Existing Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. EMERGENCY CRISIS HOTLINE BANNER */}
      <div className="bg-rose-50 border-y border-rose-200 py-4 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-rose-800">
          <PhoneCall className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-bold">In Crisis or Need Immediate Support?</span>
          <span>
            Call or text <strong>988</strong> (USA Suicide & Crisis Lifeline) or text HOME to{' '}
            <strong>741741</strong> for 24/7 free, confidential crisis counseling.
          </span>
        </div>
      </div>

      {/* 12. COMPREHENSIVE FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-xl bg-teal-600 text-white">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight">MindCare AI</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Evidence-based psychiatric assessment integrating speech prosody, facial affect, and
              explainable machine learning algorithms.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Assessment Workflow</p>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button onClick={() => setScreen('screener')} className="hover:text-white transition-colors">
                  Stage 1: Clinical Screeners (PHQ-9 & GAD-7)
                </button>
              </li>
              <li>
                <button onClick={() => setScreen('assessment')} className="hover:text-white transition-colors">
                  Stage 2: AI Voice & Facial Telemetry
                </button>
              </li>
              <li>
                <button onClick={() => setScreen('report')} className="hover:text-white transition-colors">
                  Stage 4: SHAP Diagnostic Dossier
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Security & Providers</p>
            <ul className="space-y-1 text-[11px]">
              <li>
                <Link href="/doctor" className="hover:text-white transition-colors">
                  Clinician & Provider Portal
                </Link>
              </li>
              <li>
                <button onClick={() => setScreen('consent')} className="hover:text-white transition-colors">
                  Privacy & Data Governance
                </button>
              </li>
              <li>
                <span className="text-slate-500">HIPAA & GDPR Compliant</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Legal & Medical Notice</p>
            <p className="text-[10px] leading-relaxed text-slate-500">
              MindCare AI is an assistive decision-support tool and does not constitute a formal
              psychiatric diagnosis or emergency service. For medical emergencies, call your local
              emergency number (911 / 112) immediately.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} MindCare AI Telehealth Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen('consent')} className="hover:text-slate-300">
              Privacy Policy
            </button>
            <button onClick={() => setScreen('consent')} className="hover:text-slate-300">
              Terms of Clinical Use
            </button>
            <Link href="/doctor" className="hover:text-slate-300">
              Provider Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
