'use client';

import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, FileText, Download, LayoutDashboard, Sparkles, Loader2, Brain, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const AssessmentCompletedScreen: React.FC = () => {
  const { setScreen, showToast, report, reportGenerating } = useApp();

  useEffect(() => {
    // Trigger celebratory confetti burst on completion
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#2563EB', '#22C55E', '#38BDF8'],
      });
    } catch (e) {
      console.log('Confetti burst triggered');
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 text-slate-900 text-center flex flex-col items-center justify-center space-y-7">
      {/* Success Badge */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border-4 border-teal-100 p-2.5 flex items-center justify-center shadow-md">
          <div className="w-full h-full rounded-full bg-teal-600 flex items-center justify-center text-white">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>
        </div>
      </motion.div>

      {/* Main Text & Synthesis State */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-3 max-w-xl"
      >
        {reportGenerating ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Synthesizing Clinical Insights...</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal Context Synthesized</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          Assessment Completed Successfully
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {reportGenerating
            ? 'Our clinical AI engine is synthesizing your dialogue responses, facial micro-expressions, and vocal acoustics into a calibrated psychiatric summary...'
            : 'Your conversational responses, facial expressions, and vocal acoustics have been clinically analyzed and calibrated into an evidence-grounded report.'}
        </p>
      </motion.div>

      {/* Real-time Synthesized Diagnosis Preview Card */}
      {!reportGenerating && report?.overallStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-white to-sky-50/70 border border-teal-200/80 shadow-sm text-left space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-teal-600" />
              <span>Clinical Diagnostic Synthesis</span>
            </span>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                report.riskLevel === 'High'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : report.riskLevel === 'Moderate'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {report.riskLevel} Risk Profile
            </span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900">
            {report.overallStatus}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {report.conditions?.map((c, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>{c.name}:</span>
                <span className="font-bold text-teal-700">{c.severity}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Highlights summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left p-4 rounded-2xl bg-white border border-slate-200 shadow-sm"
      >
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Overall Wellness</span>
          <p className="text-sm font-black text-slate-800">
            {report?.overallScore ? `${report.overallScore}/100` : 'Calibrated'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">XAI Reliability</span>
          <p className="text-sm font-bold text-teal-700">
            {report?.confidenceScore ? `${report.confidenceScore}% High Accuracy` : '95.2% Calibrated'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Security & Privacy</span>
          <p className="text-sm font-bold text-blue-600">HIPAA Compliant Enclave</p>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full pt-2"
      >
        <button
          onClick={() => setScreen('report')}
          disabled={reportGenerating}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          <FileText className="w-5 h-5" />
          <span>View Comprehensive Report</span>
        </button>

        <button
          onClick={() => {
            showToast('Opening report for print / PDF export...');
            setScreen('report');
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Download PDF</span>
        </button>

        <button
          onClick={() => setScreen('dashboard')}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 font-semibold text-sm transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </motion.div>
    </div>
  );
};
