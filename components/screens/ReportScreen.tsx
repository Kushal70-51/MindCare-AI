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

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Severe':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Moderate':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Mild':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 text-slate-900 space-y-8">
      {/* Report Banner & Quick Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
              Clinical Assessment Synthesis
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Date: {report.completionDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Mental Health Evaluation & SHAP Analysis
          </h1>
          <p className="text-xs text-slate-500">
            Patient: <strong className="text-slate-700">{user.fullName}</strong> • Medical ID: MC-889021
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all"
          >
            <Share2 className="w-4 h-4 text-teal-600" />
            <span>Share with Doctor</span>
          </button>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Overall Mental Health Status
          </span>
          <p className="text-base font-black text-teal-700 leading-tight">
            {report.overallStatus}
          </p>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Well-being Index</span>
            <span className="font-mono font-bold text-slate-900">{report.overallScore} / 100</span>
          </div>
        </motion.div>

        {/* Risk Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Assessed Risk Level
          </span>
          <div>
            <span
              className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full border ${getRiskBadgeColor(
                report.riskLevel
              )}`}
            >
              {report.riskLevel} Risk Profile
            </span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Based on multimodal acoustic and linguistic markers.
          </p>
        </motion.div>

        {/* Confidence Score */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            XAI Confidence Score
          </span>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            {report.confidenceScore}%
          </p>
          <p className="text-[11px] text-slate-500">High statistical reliability across screeners.</p>
        </motion.div>

        {/* Primary Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Primary Protective Signal
          </span>
          <p className="text-xs font-bold text-slate-800">
            Constructive Emotional Vocabulary & Active Coping
          </p>
          <p className="text-[11px] text-teal-700 font-medium">Strong resilience buffers detected.</p>
        </motion.div>
      </div>

      {/* Detected Conditions Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <span>Detected Conditions & Clinical Sub-indices</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {report.conditions.map((cond, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">{cond.name}</h4>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getSeverityColor(
                    cond.severity
                  )}`}
                >
                  {cond.severity} ({cond.score}/100)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${cond.score}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">{cond.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SHAP Explainable AI Section Component */}
      <ShapChart features={report.shapFeatures} />

      {/* Retrieved Supporting Evidence Quotes */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Quote className="w-5 h-5 text-teal-600" />
          <span>Retrieved Supporting Evidence & Transcript Extracts</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.retrievedEvidence.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                <span className="text-teal-700">{ev.source}</span>
                <span>{ev.timestamp}</span>
              </div>
              <p className="text-slate-700 italic font-medium">{ev.quote}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Activity & Social Context Signal (YouTube) */}
      {hasSocialData && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-rose-500" />
            <span>Digital Activity & Social Context Signal</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Public video comment sentiment */}
            {socialInsight && (
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Video Comment Sentiment
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
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-teal-600" />
                  Analyzed {socialInsight.analyzedCount} comments &middot; dominant tone:{' '}
                  <span className="font-semibold capitalize text-slate-700">{socialInsight.dominantEmotion}</span>
                </p>
              </div>
            )}

            {/* Signed-in account: subscriptions + liked-video sentiment */}
            {youtubeProfile && (
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Account Activity — {youtubeProfile.channelTitle}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {youtubeProfile.subscriptions.slice(0, 8).map((s) => (
                    <span key={s.title} className="text-[10px] px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                      {s.title}
                    </span>
                  ))}
                  {youtubeProfile.subscriptions.length === 0 && (
                    <span className="text-[11px] text-slate-400">No public subscriptions found.</span>
                  )}
                </div>
                {Object.keys(youtubeProfile.emotionDistribution).length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {Object.entries(youtubeProfile.emotionDistribution)
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
                )}
                <p className="text-[11px] text-slate-500">
                  {youtubeProfile.analyzedLikedCount} liked videos analyzed &middot; dominant tone:{' '}
                  <span className="font-semibold capitalize text-slate-700">{youtubeProfile.dominantEmotion}</span>
                </p>
              </div>
            )}

            {/* Signed-in Reddit account: subscribed communities + comment sentiment */}
            {redditProfile && (
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Account Activity — u/{redditProfile.username}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {redditProfile.subscribedSubreddits.slice(0, 8).map((s) => (
                    <span key={s.name} className="text-[10px] px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                      {s.name}
                    </span>
                  ))}
                  {redditProfile.subscribedSubreddits.length === 0 && (
                    <span className="text-[11px] text-slate-400">No subscribed communities found.</span>
                  )}
                </div>
                {Object.keys(redditProfile.emotionDistribution).length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {Object.entries(redditProfile.emotionDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([label, share]) => (
                        <div key={label} className="flex items-center gap-2 text-[10px]">
                          <span className="w-14 shrink-0 capitalize text-slate-500">{label}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(share * 100).toFixed(0)}%`, backgroundColor: EMOTION_COLOR[label] || '#f97316' }}
                            />
                          </div>
                          <span className="w-9 text-right font-mono text-slate-600">{(share * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-500">
                  {redditProfile.analyzedCommentCount} comments analyzed &middot; dominant tone:{' '}
                  <span className="font-semibold capitalize text-slate-700">{redditProfile.dominantEmotion}</span>
                </p>
              </div>
            )}

            {/* Instagram: user's own official data export */}
            {instagramProfile && (
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Account Activity — Instagram Export
                </p>
                {Object.keys(instagramProfile.emotionDistribution).length > 0 && (
                  <div className="space-y-1.5">
                    {Object.entries(instagramProfile.emotionDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([label, share]) => (
                        <div key={label} className="flex items-center gap-2 text-[10px]">
                          <span className="w-14 shrink-0 capitalize text-slate-500">{label}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(share * 100).toFixed(0)}%`, backgroundColor: EMOTION_COLOR[label] || '#ec4899' }}
                            />
                          </div>
                          <span className="w-9 text-right font-mono text-slate-600">{(share * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-500">
                  {instagramProfile.analyzedCount} posts/comments analyzed &middot; dominant tone:{' '}
                  <span className="font-semibold capitalize text-slate-700">{instagramProfile.dominantEmotion}</span>
                </p>
              </div>
            )}

            {/* LLM-narrated activity timing + lifestyle signal — YouTube */}
            {youtubeActivityInsight && (
              <div className="p-5 rounded-3xl bg-teal-50 border border-teal-200 shadow-sm space-y-3 lg:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  YouTube Activity Timing & Lifestyle Signal (AI-analyzed)
                </p>

                {youtubeActivityInsight.distribution.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {[...youtubeActivityInsight.distribution]
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((d) => (
                        <div key={d.segment} className="flex items-center gap-2 text-[10px]">
                          <span className="w-36 shrink-0 text-slate-600">{d.segment}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white border border-teal-200 overflow-hidden">
                            <div className="h-full rounded-full bg-teal-500" style={{ width: `${d.percentage}%` }} />
                          </div>
                          <span className="w-9 text-right font-mono text-slate-600">{d.percentage}%</span>
                        </div>
                      ))}
                  </div>
                )}

                <p className="text-xs text-slate-700 leading-relaxed">{youtubeActivityInsight.summary}</p>

                {youtubeActivityInsight.lifestyleSignal && (
                  <p className="text-[11px] text-teal-800 flex items-start gap-1.5">
                    <Moon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{youtubeActivityInsight.lifestyleSignal}</span>
                  </p>
                )}
              </div>
            )}

            {/* LLM-narrated activity timing + lifestyle signal — Reddit */}
            {redditActivityInsight && (
              <div className="p-5 rounded-3xl bg-orange-50 border border-orange-200 shadow-sm space-y-3 lg:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Reddit Activity Timing & Lifestyle Signal (AI-analyzed)
                </p>

                {redditActivityInsight.distribution.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {[...redditActivityInsight.distribution]
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((d) => (
                        <div key={d.segment} className="flex items-center gap-2 text-[10px]">
                          <span className="w-36 shrink-0 text-slate-600">{d.segment}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white border border-orange-200 overflow-hidden">
                            <div className="h-full rounded-full bg-orange-500" style={{ width: `${d.percentage}%` }} />
                          </div>
                          <span className="w-9 text-right font-mono text-slate-600">{d.percentage}%</span>
                        </div>
                      ))}
                  </div>
                )}

                <p className="text-xs text-slate-700 leading-relaxed">{redditActivityInsight.summary}</p>

                {redditActivityInsight.lifestyleSignal && (
                  <p className="text-[11px] text-orange-800 flex items-start gap-1.5">
                    <Moon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{redditActivityInsight.lifestyleSignal}</span>
                  </p>
                )}
              </div>
            )}

            {/* LLM-narrated activity timing + lifestyle signal — Instagram */}
            {instagramActivityInsight && (
              <div className="p-5 rounded-3xl bg-pink-50 border border-pink-200 shadow-sm space-y-3 lg:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Instagram Activity Timing & Lifestyle Signal (AI-analyzed)
                </p>

                {instagramActivityInsight.distribution.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {[...instagramActivityInsight.distribution]
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((d) => (
                        <div key={d.segment} className="flex items-center gap-2 text-[10px]">
                          <span className="w-36 shrink-0 text-slate-600">{d.segment}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white border border-pink-200 overflow-hidden">
                            <div className="h-full rounded-full bg-pink-500" style={{ width: `${d.percentage}%` }} />
                          </div>
                          <span className="w-9 text-right font-mono text-slate-600">{d.percentage}%</span>
                        </div>
                      ))}
                  </div>
                )}

                <p className="text-xs text-slate-700 leading-relaxed">{instagramActivityInsight.summary}</p>

                {instagramActivityInsight.lifestyleSignal && (
                  <p className="text-[11px] text-pink-800 flex items-start gap-1.5">
                    <Moon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{instagramActivityInsight.lifestyleSignal}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations & References */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Actionable Clinical Recommendations</span>
          </h3>

          <div className="space-y-3">
            {report.recommendations.map((rec) => (
              <div key={rec.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{rec.title}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medical References */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Peer-Reviewed Clinical Evidence References</span>
          </h3>

          <div className="space-y-3">
            {report.medicalReferences.map((ref) => (
              <div key={ref.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <h4 className="font-bold text-slate-800">{ref.title}</h4>
                <p className="text-[11px] text-slate-500">
                  {ref.authors} ({ref.year}) • <em>{ref.journal}</em>
                </p>
                <p className="text-[10px] text-teal-700 font-mono">DOI: {ref.doi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session History / Trend Tracking */}
      <ReportHistoryTrend history={reportHistory} />

      {/* PDF Download & Share Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        report={report}
        user={user}
        showToast={showToast}
        onShared={(reportId, doctorName) => setSharedDoctor({ reportId, doctorName })}
      />

      {/* Floating report Q&A assistant — has the full report as context */}
      <ReportChatbot report={report} />

      {/* Once shared, lets the patient message/video-call that doctor directly */}
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
