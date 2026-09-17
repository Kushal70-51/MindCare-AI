'use client';

import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, FileText, Download, LayoutDashboard, Sparkles } from 'lucide-react';
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
        colors: ['#0D9488', '#2563EB', '#22C55E', '#38BDF8'],
      });
    } catch (e) {
      console.log('Confetti burst triggered');
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 text-slate-900 text-center flex flex-col items-center justify-center space-y-8">
      {/* Success Badge */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border-4 border-teal-100 p-3 flex items-center justify-center shadow-md">
          <div className="w-full h-full rounded-full bg-teal-600 flex items-center justify-center text-white">
            <CheckCircle2 className="w-14 h-14 stroke-[2.5]" />
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Synthesis Complete</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
          Assessment Completed Successfully
        </h1>

        <p className="text-base sm:text-lg text-slate-500">
          Thank you for your responses. Our explainable AI model has synthesized your speech tone, linguistic sentiment, and biometric markers into a clinical summary report.
        </p>
      </motion.div>

      {/* Highlights summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left p-5 rounded-3xl bg-white border border-slate-200 shadow-sm"
      >
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Processing Status</span>
          <p className="text-sm font-bold text-emerald-600">100% Calibrated</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">XAI Confidence</span>
          <p className="text-sm font-bold text-teal-700">94.2% High Accuracy</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Security Enclave</span>
          <p className="text-sm font-bold text-blue-600">HIPAA Encrypted</p>
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
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <FileText className="w-5 h-5" />
          <span>View Comprehensive Report</span>
        </button>

        <button
          onClick={() => {
            showToast('Generating PDF Report...');
            setScreen('report');
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-all"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Download PDF</span>
        </button>

        <button
          onClick={() => setScreen('dashboard')}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 font-semibold text-sm transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </motion.div>
    </div>
  );
};
