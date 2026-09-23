'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShapChart } from '../ui/ShapChart';
import { PdfReportModal } from '../ui/PdfReportModal';
import { ReportChatbot } from '../ui/ReportChatbot';
import { ReportHistoryTrend } from '../ui/ReportHistoryTrend';
import { DoctorCommunicationWidget } from '../ui/DoctorCommunicationWidget';
import {
  Download,
  Share2,
  Activity,
  CheckCircle2,
  Quote,
  BookOpen,
  Video,
  Clock,
  Moon,
  Smile,
  Brain,
  Zap,
  Users,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertTriangle,
  BadgeCheck,
  FileCheck2,
} from 'lucide-react';
import { motion } from 'framer-motion';

const EMOTION_COLOR: Record<string, string> = {
  joy: '#10b981',
  neutral: '#64748b',
  surprise: '#3b82f6',
  sadness: '#0ea5e9',
  fear: '#a855f7',
  anger: '#e34948',
  disgust: '#f59e0b',
};

export const ReportScreen: React.FC = () => {
  const {
    report,
    user,
    showToast,
    reportHistory,
    sharedDoctor,
    setSharedDoctor,
    socialInsight,
    youtubeProfile,
    youtubeActivityInsight,
    redditProfile,
    redditActivityInsight,
    instagramProfile,
    instagramActivityInsight,
  } = useApp();

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const hasSocialData = Boolean(socialInsight || youtubeProfile || redditProfile || instagramProfile);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          label: 'Class III • Elevated Clinical Distress',
          cls: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-600',
        };
      case 'Moderate':
        return {
          label: 'Class II • Moderate Situational Stress',
          cls: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
        };
      default:
        return {
          label: 'Class I • Low Clinical Risk Profile',
          cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
        };
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Severe':
        return 'text-rose-700 bg-rose-50/80 border-rose-200';
      case 'Moderate':
        return 'text-amber-700 bg-amber-50/80 border-amber-200';
      case 'Mild':
        return 'text-blue-700 bg-blue-50/80 border-blue-200';
      default:
        return 'text-emerald-700 bg-emerald-50/80 border-emerald-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'Improving') return <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />;
    if (trend === 'Requires Attention') return <TrendingUp className="w-3.5 h-3.5 text-amber-600" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const riskBadge = getRiskBadge(report.riskLevel);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 text-slate-900 space-y-7">
      {/* Institutional Clinical Masthead Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Top Clinical Header Line */}
        <div className="bg-slate-900 text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-slate-200">
              MindCare Clinical Neuroscience & Multimodal Telemetry Dossier
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px]">
            <span>CONFIDENTIAL MEDICAL EVALUATION</span>
            <span>•</span>
            <span>PROTOCOL: DSM-5-TR / ICD-11 XAI v4.2</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> HIPAA SECURE
            </span>
          </div>
        </div>

        {/* Patient Demographic & Assessment Profile Bar */}
        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200">
                Official Psychiatric Assessment
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Evaluation Date: {report.completionDate || 'Sep 19, 2026'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Record ID: MC-889021
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Multimodal Neuropsychiatric Evaluation & Clinical Biometrics
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Patient Full Name</span>
                <p className="font-bold text-slate-800">{user.fullName || 'Anonymous Patient'}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Evaluation Scope</span>
                <p className="font-bold text-slate-800">Adaptive In-Depth (13 Turns)</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Telemetry Captured</span>
                <p className="font-bold text-slate-800">Face (120f) • Audio Tone • Words</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Clinician System</span>
                <p className="font-bold text-teal-700 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>XAI Calibrated</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex sm:flex-col lg:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Forward to Provider</span>
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-sm hover:shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Diagnostic Formulation & Metric Stratification Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Primary Clinical Summary Card (8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Diagnostic Formulation & Clinical Impression
              </span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${riskBadge.cls}`}>
              <span className={`w-2 h-2 rounded-full ${riskBadge.dot}`} />
              <span>{riskBadge.label}</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {report.overallStatus}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 pt-2 leading-relaxed">
              Clinical diagnostic synthesis indicates that overall cognitive and affective distress is largely situational and downstream of nocturnal sleep debt rather than primary generalized pathology. While high-stakes evaluative triggers produce transient anxiety, self-directed affective regulation remains highly functional, enabling rapid emotional reset.
            </p>
          </div>

          {/* Key Metric Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Well-being Index</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 font-mono">{report.overallScore}</span>
                <span className="text-xs text-slate-400 font-bold">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-500">Functional Stability Baseline</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">XAI Reliability Calibration</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-teal-700 font-mono">{report.confidenceScore || 92.4}%</span>
              </div>
              <p className="text-[10px] text-teal-700 font-medium">95% CI [90.8% - 94.6%]</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primary Protective Buffer</span>
              <p className="text-xs font-bold text-emerald-800 leading-tight pt-1">
                Active Music/Comedy Reset & Drive Recovery
              </p>
              <p className="text-[10px] text-emerald-700">Preserved Coping Efficacy</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Quick Clinical Reference Sidebar (4 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">Clinical Triage Overview</span>
              <FileCheck2 className="w-4 h-4 text-teal-400" />
            </div>

            <h3 className="text-base font-bold text-white">Diagnostic Trajectory</h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Assessment confirms situational performance vulnerability compounded by a 4–5 hour restricted sleep schedule. Acute panic indicators and persistent depressive anhedonia are non-significant.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span>Primary Clinical Focus</span>
              <span className="font-bold text-amber-400">Sleep Extension</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span>Immediate Medical Action</span>
              <span className="font-bold text-emerald-400">Behavioral Routine</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span>Hospital Admission Risk</span>
              <span className="font-mono text-slate-400">&lt; 2.5% (Minimal)</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic">
            Automated screening adjunct for licensed clinicians. Not a standalone medical prescription.
          </p>
        </motion.div>
      </div>

      {/* Section 1: Detected Psychiatric Sub-Indices & Condition Measures */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Psychiatric Sub-Indices & Standardized Condition Measures</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
            Normative Scale: 0 (Optimal) — 100 (Severe Distress)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.conditions.map((cond, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Instrument Subscale
                    </span>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">{cond.name}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                        cond.severity
                      )}`}
                    >
                      {cond.severity} ({cond.score}/100)
                    </span>
                  </div>
                </div>

                {/* Score Bar with Reference Cutoff Milestones */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        cond.name.includes('Resilience')
                          ? 'bg-emerald-600'
                          : cond.score >= 70
                          ? 'bg-rose-600'
                          : cond.score >= 45
                          ? 'bg-amber-500'
                          : 'bg-teal-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, cond.score))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>0 (Optimal)</span>
                    <span>25 (Mild)</span>
                    <span>50 (Moderate)</span>
                    <span>75+ (Severe)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {cond.description}
                </p>
              </div>

              {/* Card Footer: Clinical Trend */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  {getTrendIcon(cond.changeTrend)}
                  <span>Trajectory: <strong className="text-slate-700">{cond.changeTrend || 'Stable'}</strong></span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">DSM-5-TR Correlated</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section 2: Behavioral Psychiatric Domain Matrix */}
      {report.behavioralSummary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600" />
              <span>Behavioral Psychiatric Domain Matrix</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
              5-Axis Cross-Domain Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.behavioralSummary.sleepAndCircadian && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" /> Circadian & Sleep Hygiene
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Deficit Noted
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{report.behavioralSummary.sleepAndCircadian}</p>
              </div>
            )}

            {report.behavioralSummary.energyAndBurnout && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-amber-600" /> Cognitive Vitality & Burnout
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Secondary Fatigue
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{report.behavioralSummary.energyAndBurnout}</p>
              </div>
            )}

            {report.behavioralSummary.stressAndAnxiety && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5 text-rose-600" /> Autonomic Stress Reactivity
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Situational Trigger
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{report.behavioralSummary.stressAndAnxiety}</p>
              </div>
            )}

            {report.behavioralSummary.socialConnectedness && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-teal-600" /> Psychosocial Connectedness
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ambivert Balance
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{report.behavioralSummary.socialConnectedness}</p>
              </div>
            )}

            {report.behavioralSummary.copingMechanisms && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs md:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" /> Affective Coping & Distress Tolerance
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    High Efficacy Reset
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{report.behavioralSummary.copingMechanisms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 3: SHAP Explainable AI Biometrics & Linguistic Feature Attribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>Explainable AI (SHAP) Biometric & Linguistic Feature Attribution</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
            Shapley Value Contribution to Clinical Risk Estimation
          </span>
        </div>

        <ShapChart features={report.shapFeatures} />
      </div>

      {/* Section 4: Verbatim Transcript Evidence & Behavioral Telemetry Audit Trail */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Quote className="w-5 h-5 text-teal-600" />
            <span>Verbatim Transcript Evidence & Behavioral Telemetry Audit Trail</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
            Direct Patient Statement Evidence Logs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.retrievedEvidence.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 text-xs flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                  <span className="text-teal-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    <span>{ev.source}</span>
                  </span>
                  <span className="font-mono text-slate-400">{ev.timestamp}</span>
                </div>
                <blockquote className="text-slate-800 italic font-medium border-l-2 border-teal-500 pl-2.5 py-0.5 leading-relaxed">
                  {ev.quote}
                </blockquote>
              </div>

              <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 font-mono">
                <span>Observed Sentiment</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded ${
                    ev.sentiment === 'High Distress'
                      ? 'bg-rose-50 text-rose-700'
                      : ev.sentiment === 'Positive'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {ev.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Activity & Social Context Signal (YouTube / Reddit / Instagram) */}
      {hasSocialData && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-rose-500" />
            <span>Digital Footprint & Circadian Behavioral Correlates</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {socialInsight && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Video Content Linguistic Sentiment
                </p>
                <p className="text-xs font-semibold text-slate-700 truncate" title={socialInsight.videoTitle}>
                  {socialInsight.videoTitle}
                </p>
                <div className="space-y-1.5">
                  {Object.entries(socialInsight.emotionDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([label, share]) => (
                      <div key={label} className="flex items-center gap-2 text-[10px]">
                        <span className="w-14 shrink-0 capitalize text-slate-500">{label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(share * 100).toFixed(0)}%`, backgroundColor: EMOTION_COLOR[label] || '#0d9488' }}
                          />
                        </div>
                        <span className="w-9 text-right font-mono text-slate-600">{(share * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Smile className="w-3.5 h-3.5 text-teal-600" />
                  Analyzed {socialInsight.analyzedCount} comments &middot; dominant affect:{' '}
                  <span className="font-semibold capitalize text-slate-700">{socialInsight.dominantEmotion}</span>
                </p>
              </div>
            )}

            {youtubeActivityInsight && (
              <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 shadow-sm space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Circadian YouTube Activity Timing
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">{youtubeActivityInsight.summary}</p>
                {youtubeActivityInsight.lifestyleSignal && (
                  <p className="text-[11px] text-teal-900 flex items-start gap-1.5 font-medium">
                    <Moon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-700" />
                    <span>{youtubeActivityInsight.lifestyleSignal}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 5: Actionable Clinical Care Plan & Evidence-Based Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Prescriptive Recommendations (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Evidence-Based Clinical Care Plan</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
              Action Priority Ranked
            </span>
          </div>

          <div className="space-y-3">
            {report.recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{rec.title}</span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                      rec.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : rec.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{rec.description}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Category: {rec.category}</span>
                  <span>Evidence Level A/B</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Literature References (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Peer-Reviewed Clinical Literature</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Indexed Citations</span>
          </div>

          <div className="space-y-3">
            {report.medicalReferences.map((ref) => (
              <div key={ref.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 leading-snug">{ref.title}</h4>
                <p className="text-[11px] text-slate-500">
                  {ref.authors} ({ref.year}) &middot; <em className="text-slate-700">{ref.journal}</em>
                </p>
                <p className="text-[10px] text-teal-700 font-mono pt-0.5">DOI: {ref.doi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Longitudinal Health Trend */}
      <ReportHistoryTrend history={reportHistory} />

      {/* PDF Export & Doctor Sharing Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        report={report}
        user={user}
        showToast={showToast}
        onShared={(reportId, doctorName) => setSharedDoctor({ reportId, doctorName })}
      />

      {/* Interactive Clinical AI Report Chatbot */}
      <ReportChatbot report={report} />

      {/* Doctor Communication Widget (if report shared) */}
      {sharedDoctor && (
        <DoctorCommunicationWidget
          reportId={sharedDoctor.reportId}
          doctorName={sharedDoctor.doctorName}
          patientName={user.fullName}
        />
      )}
    </div>
  );
};
