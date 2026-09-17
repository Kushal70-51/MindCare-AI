'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const SplashScreen: React.FC = () => {
  const { setScreen } = useApp();
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 12;
      });
    }, 180);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 text-slate-900 overflow-hidden">
      {/* Soft background wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50/70 via-[#F4F7F6] to-[#F4F7F6] -z-10" />
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-teal-100/60 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl -z-10" />

      <div className="max-w-2xl w-full text-center space-y-8 flex flex-col items-center">
        {/* Brain Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative group cursor-pointer"
          onClick={() => setScreen('welcome')}
        >
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white border border-slate-200 p-2 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <div className="w-full h-full rounded-full bg-teal-600 flex items-center justify-center">
              <Brain className="w-16 h-16 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Title & Tagline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Evidence-Based Healthcare AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
            MindCare AI
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
            AI-Powered Evidence-Based Mental Health Assessment
          </p>
        </motion.div>

        {/* Loading Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm space-y-2"
        >
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1">
            <span>Loading Neural Models...</span>
            <span className="font-mono text-teal-700">{progress}%</span>
          </div>
        </motion.div>

        {/* Primary CTA Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => setScreen('welcome')}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
};
