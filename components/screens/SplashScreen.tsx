'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, ArrowRight, Sparkles, Shield, Activity } from 'lucide-react';
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
    <div className="relative min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 -z-10" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl animate-pulse delay-700" />
      </div>

      <div className="max-w-2xl w-full text-center space-y-8 flex flex-col items-center">
        {/* Animated Brain Logo Sphere */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative group cursor-pointer"
          onClick={() => setScreen('welcome')}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity" />
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-900/80 border-2 border-white/20 p-2 backdrop-blur-xl flex items-center justify-center shadow-2xl">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-inner">
              <Brain className="w-20 h-20 text-white animate-pulse" />
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-widest shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Next-Gen Healthcare AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
            MindCare AI
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-300 max-w-lg mx-auto leading-relaxed">
            AI-Powered Evidence-Based Mental Health Assessment
          </p>
        </motion.div>

        {/* Animated Loading Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm space-y-2"
        >
          <div className="w-full bg-slate-900/80 border border-white/10 rounded-full h-2.5 overflow-hidden p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_#14b8a6]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1">
            <span>Loading Neural Models...</span>
            <span className="font-mono text-teal-300">{progress}%</span>
          </div>
        </motion.div>

        {/* Primary CTA Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => setScreen('welcome')}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-slate-950 font-bold text-base shadow-[0_0_30px_rgba(20,184,166,0.5)] hover:shadow-[0_0_45px_rgba(20,184,166,0.8)] hover:scale-105 transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
};
