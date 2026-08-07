'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, ShieldCheck, BarChart3, FileCode2, ArrowRight, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const WelcomeScreen: React.FC = () => {
  const { setScreen } = useApp();

  const features = [
    {
      icon: Brain,
      title: 'AI Mental Health Assessment',
      description: 'Multimodal evaluation integrating acoustic tone analysis, speech sentiment, and facial affect indicators.',
      color: 'from-blue-500 to-cyan-400',
      badge: 'Multimodal AI',
    },
    {
      icon: ShieldCheck,
      title: 'Privacy First Architecture',
      description: 'End-to-end encryption with zero third-party data selling. You retain total ownership of your assessment data.',
      color: 'from-teal-400 to-emerald-500',
      badge: 'HIPAA & GDPR',
    },
    {
      icon: BarChart3,
      title: 'Evidence-Based Report',
      description: 'Clinically calibrated against PHQ-9, GAD-7, and PSQI sleep parameters for accurate insights.',
      color: 'from-emerald-400 to-teal-600',
      badge: 'Clinical Grade',
    },
    {
      icon: FileCode2,
      title: 'Transparent AI (SHAP)',
      description: 'Full explainability. Understand precisely which factors contributed to your overall mental health status.',
      color: 'from-indigo-500 to-blue-600',
      badge: 'XAI Framework',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 text-white space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-teal-400/30 text-teal-300 text-xs font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Empathetic • Safe • Evidence-Based</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent"
        >
          Welcome to MindCare AI
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-xl text-slate-300 leading-relaxed"
        >
          Your mental well-being matters. Our AI assistant performs an evidence-based mental health assessment while protecting your privacy.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button
            onClick={() => setScreen('register')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-xl hover:shadow-teal-500/30 hover:scale-105 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account</span>
          </button>

          <button
            onClick={() => setScreen('login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white font-semibold text-sm transition-all"
          >
            <LogIn className="w-4 h-4 text-teal-400" />
            <span>Login to Portal</span>
          </button>
        </motion.div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 hover:border-teal-400/40 shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${feat.color} text-slate-950 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors mb-2">
                  {feat.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
