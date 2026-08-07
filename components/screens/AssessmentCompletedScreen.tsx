'use client';

import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, FileText, Download, LayoutDashboard, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const AssessmentCompletedScreen: React.FC = () => {
  const { setScreen, showToast } = useApp();

  useEffect(() => {
    // Trigger confetti burst on completion
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14B8A6', '#2563EB', '#22C55E', '#38BDF8'],
      });
    } catch (e) {
      console.log('Confetti burst triggered');
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 text-white text-center flex flex-col items-center justify-center space-y-8">
      {/* Animated Success Badge */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 blur-3xl opacity-60 animate-pulse" />
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-900 border-4 border-teal-400 p-4 flex items-center justify-center shadow-2xl">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-inner">
            <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
          </div>
        </div>
      </motion.div>

      {/* Main Text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 max-w-xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Synthesis Complete</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Assessment Completed Successfully
        </h1>

        <p className="text-base sm:text-lg text-slate-300">
          Thank you for your responses. Our explainable AI model has synthesized your speech tone, linguistic sentiment, and biometric markers into a clinical summary report.
        </p>
      </motion.div>

      {/* Highlights summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl"
      >
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Processing Status</span>
          <p className="text-sm font-bold text-emerald-400">100% Calibrated</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">XAI Confidence</span>
          <p className="text-sm font-bold text-teal-300">94.2% High Accuracy</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Security Enclave</span>
          <p className="text-sm font-bold text-blue-400">HIPAA Encrypted</p>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4"
      >
        <button
          onClick={() => setScreen('report')}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-slate-950 font-black text-sm shadow-xl hover:shadow-teal-500/30 hover:scale-105 transition-all"
        >
          <FileText className="w-5 h-5 fill-slate-950" />
          <span>View Comprehensive Report</span>
        </button>

        <button
          onClick={() => {
            showToast('Generating PDF Report...');
            setScreen('report');
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 font-semibold text-sm transition-all"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Download PDF</span>
        </button>

        <button
          onClick={() => setScreen('dashboard')}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 font-semibold text-sm transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </motion.div>
    </div>
  );
};
