'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShapChart } from '../ui/ShapChart';
import { PdfReportModal } from '../ui/PdfReportModal';
import {
  FileText,
  Download,
  Share2,
  ShieldCheck,
  Activity,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Quote,
  BookOpen,
  Sparkles,
  Award,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ReportScreen: React.FC = () => {
  const { report, user, showToast } = useApp();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Severe':
        return 'text-rose-400 bg-rose-950/60 border-rose-500/30';
      case 'Moderate':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
      case 'Mild':
        return 'text-blue-400 bg-blue-950/60 border-blue-500/30';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Report Banner & Quick Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
              Clinical Assessment Synthesis
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Date: {report.completionDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Mental Health Evaluation & SHAP Analysis
          </h1>
          <p className="text-xs text-slate-400">
            Patient: <strong className="text-slate-200">{user.fullName}</strong> • Medical ID: MC-889021
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 text-xs font-semibold transition-all"
          >
            <Share2 className="w-4 h-4 text-teal-400" />
            <span>Share with Doctor</span>
          </button>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg hover:shadow-teal-500/25 transition-all"
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
          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overall Mental Health Status
          </span>
          <p className="text-base font-black text-teal-300 leading-tight">
            {report.overallStatus}
          </p>
          <div className="text-xs text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
            <span>Well-being Index</span>
            <span className="font-mono font-bold text-white">{report.overallScore} / 100</span>
          </div>
        </motion.div>

        {/* Risk Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
          <p className="text-[11px] text-slate-400 pt-1">
            Based on multimodal acoustic and linguistic markers.
          </p>
        </motion.div>

        {/* Confidence Score */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            XAI Confidence Score
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {report.confidenceScore}%
          </p>
          <p className="text-[11px] text-slate-400">High statistical reliability across screeners.</p>
        </motion.div>

        {/* Primary Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Primary Protective Signal
          </span>
          <p className="text-xs font-bold text-slate-200">
            Constructive Emotional Vocabulary & Active Coping
          </p>
          <p className="text-[11px] text-teal-400 font-medium">Strong resilience buffers detected.</p>
        </motion.div>
      </div>

      {/* Detected Conditions Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" />
          <span>Detected Conditions & Clinical Sub-indices</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {report.conditions.map((cond, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100">{cond.name}</h4>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getSeverityColor(
                    cond.severity
                  )}`}
                >
                  {cond.severity} ({cond.score}/100)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-teal-400 to-blue-500 h-full rounded-full"
                  style={{ width: `${cond.score}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{cond.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SHAP Explainable AI Section Component */}
      <ShapChart features={report.shapFeatures} />

      {/* Retrieved Supporting Evidence Quotes */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Quote className="w-5 h-5 text-teal-400" />
          <span>Retrieved Supporting Evidence & Transcript Extracts</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.retrievedEvidence.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                <span className="text-teal-300">{ev.source}</span>
                <span>{ev.timestamp}</span>
              </div>
              <p className="text-slate-200 italic font-medium">{ev.quote}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations & References */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Actionable Clinical Recommendations</span>
          </h3>

          <div className="space-y-3">
            {report.recommendations.map((rec) => (
              <div key={rec.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{rec.title}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medical References */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Peer-Reviewed Clinical Evidence References</span>
          </h3>

          <div className="space-y-3">
            {report.medicalReferences.map((ref) => (
              <div key={ref.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1 text-xs">
                <h4 className="font-bold text-slate-200">{ref.title}</h4>
                <p className="text-[11px] text-slate-400">
                  {ref.authors} ({ref.year}) • <em>{ref.journal}</em>
                </p>
                <p className="text-[10px] text-teal-400 font-mono">DOI: {ref.doi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Download & Share Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        report={report}
        user={user}
        showToast={showToast}
      />
    </div>
  );
};
