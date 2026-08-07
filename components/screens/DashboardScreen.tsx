'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, Play, Clock, CheckCircle2, ShieldCheck, Sparkles, Activity, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardScreen: React.FC = () => {
  const { setScreen, user, answers, questions } = useApp();

  const completedCount = answers.length;
  const totalQuestions = questions.length;
  const progressPercent = Math.round((completedCount / totalQuestions) * 100);

  const domains = [
    { name: 'Mood & Emotional State', status: '5 Prompts', icon: Brain },
    { name: 'Stress & Anxiety Dynamics', status: 'Multimodal Spectrum', icon: Activity },
    { name: 'Sleep Architecture & Rest', status: 'PSQI Calibrated', icon: Clock },
    { name: 'Social Support & Isolation', status: 'Contextual Sentiment', icon: Sparkles },
    { name: 'Resilience & Coping Mechanisms', status: 'XAI SHAP Model', icon: ShieldCheck },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-400 shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg">
              {user.fullName[0]}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Welcome back, {user.fullName}!
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Patient ID: {user.id} • Patient Status: Active & Ready
            </p>
          </div>
        </div>

        <button
          onClick={() => setScreen('report')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 text-xs font-semibold transition-all"
        >
          <FileText className="w-4 h-4 text-teal-400" />
          <span>View Previous Reports</span>
        </button>
      </div>

      {/* Main Large Hero Card for Mental Health Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-teal-500/40 p-8 sm:p-10 shadow-2xl overflow-hidden space-y-8"
      >
        {/* Decorative Background Halo */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-bl from-teal-500/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive AI Session</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Mental Health Assessment
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Our AI assistant will ask a series of questions. Please answer naturally using your microphone or keyboard. Your speech tone, sentiment, and affect will be synthesized into an explainable XAI report.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Estimated Time: <strong className="text-white">10–15 Minutes</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA Encrypted Stream</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Start CTA */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="w-full sm:max-w-xs space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Assessment Readiness</span>
              <span className="text-teal-300">{completedCount === 0 ? 'Ready to Start' : `${progressPercent}% Completed`}</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(10, progressPercent)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setScreen('assessment')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-slate-950 font-black text-base shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:shadow-[0_0_45px_rgba(20,184,166,0.7)] hover:scale-105 transition-all"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Start Assessment</span>
          </button>
        </div>
      </motion.div>

      {/* Assessment Domain Checklist */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span>Multimodal Screening Modules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((d, i) => {
            const Icon = d.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md flex items-center gap-3"
              >
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-400/30">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{d.name}</h4>
                  <p className="text-[10px] text-slate-400">{d.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
