'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, Play, Clock, CheckCircle2, ShieldCheck, Sparkles, FileText, ClipboardList, Mic, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardScreen: React.FC = () => {
  const { setScreen, user, answers, logoutUser, reportHistory, loadPastReport } = useApp();

  const completedCount = answers.length;
  const progressPercent = completedCount > 0 ? 100 : 10;

  const domains = [
    { name: 'Depression & Anxiety (PHQ-9 / GAD-7)', status: 'Validated Screener', icon: ClipboardList },
    { name: 'Mood & Emotional State', status: 'Adaptive AI Interview', icon: Brain },
    { name: 'Vocal Tone & Speech Acoustics', status: 'wav2vec2 Model', icon: Mic },
    { name: 'Sleep Architecture & Rest', status: 'PSQI Calibrated', icon: Clock },
    { name: 'Social Support & Isolation', status: 'Contextual Sentiment', icon: Sparkles },
    { name: 'Resilience & Coping Mechanisms', status: 'XAI SHAP Model', icon: ShieldCheck },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 text-slate-900 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          {user.avatarUrl && user.isLoggedIn ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-400"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-teal-600 text-white font-black text-xl flex items-center justify-center">
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {user.isLoggedIn ? `Welcome back, ${user.fullName}!` : 'Welcome to MindCare AI'}
              </h2>
              {user.isLoggedIn && (
                <>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    SQLite Synced
                  </span>
                  {(user as any).auth_provider && (user as any).auth_provider !== 'email' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      {(user as any).auth_provider} SSO
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.isLoggedIn
                ? `Account: ${user.email} • ID: ${user.id}`
                : 'Sign in to automatically save and sync your assessment test history in the database.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.isLoggedIn ? (
            <button
              onClick={logoutUser}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setScreen('login')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          <button
            onClick={() => setScreen('report')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Reports {reportHistory.length > 0 && `(${reportHistory.length})`}</span>
          </button>
        </div>
      </div>

      {/* Main Large Hero Card for Mental Health Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl bg-gradient-to-br from-teal-50 via-white to-blue-50 border border-teal-200 p-8 sm:p-10 shadow-sm overflow-hidden space-y-8"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Interactive AI Session</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Mental Health Assessment
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Our AI assistant will ask a series of questions. Please answer naturally using your microphone or keyboard. Your speech tone, sentiment, and affect will be synthesized into an explainable XAI report.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Estimated Time: <strong className="text-slate-900">10–15 Minutes</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>HIPAA Encrypted Stream</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Start CTA */}
        <div className="relative z-10 pt-6 border-t border-teal-200/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="w-full sm:max-w-xs space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600">Assessment Readiness</span>
              <span className="text-teal-700">{completedCount === 0 ? 'Ready to Start' : `${progressPercent}% Completed`}</span>
            </div>
            <div className="w-full bg-white rounded-full h-2.5 border border-slate-200">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(10, progressPercent)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setScreen('screener')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-base shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Assessment</span>
          </button>
        </div>
      </motion.div>

      {/* Past Saved Assessment Reports */}
      {reportHistory && reportHistory.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Saved Assessment Reports ({reportHistory.length})</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Click any report to view details & XAI insights
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/40 border border-slate-200 hover:border-teal-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        item.riskLevel === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : item.riskLevel === 'Moderate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.riskLevel} Risk
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{item.overallScore}</span>
                    <span className="text-xs text-slate-500 font-semibold">/ 100 Index Score</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                    <span>PHQ-9: {item.phq9Total ?? 'N/A'}</span>
                    <span>•</span>
                    <span>GAD-7: {item.gad7Total ?? 'N/A'}</span>
                  </div>
                </div>

                <button
                  onClick={() => loadPastReport(item)}
                  className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Full Report</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Domain Checklist */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-teal-600" />
          <span>Multimodal Screening Modules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((d, i) => {
            const Icon = d.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3"
              >
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{d.name}</h4>
                  <p className="text-[10px] text-slate-500">{d.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
