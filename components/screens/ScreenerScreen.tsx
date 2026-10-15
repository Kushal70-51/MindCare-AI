'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  SCREENER_QUESTIONS,
  RESPONSE_OPTIONS,
  isScreenerComplete,
  scorePHQ9,
  scoreGAD7,
} from '../../utils/screeners';
import { AssessmentStepper } from '../ui/AssessmentStepper';
import {
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  SkipForward,
  Sparkles,
  HeartPulse,
  Brain,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';

const InstrumentSection: React.FC<{
  title: string;
  subtitle: string;
  instrumentCode: 'PHQ-9' | 'GAD-7';
  questions: typeof PHQ9_QUESTIONS;
  responses: Record<string, number>;
  onAnswer: (id: string, value: number) => void;
}> = ({ title, subtitle, instrumentCode, questions, responses, onAnswer }) => {
  const isDepression = instrumentCode === 'PHQ-9';
  const answeredInInstrument = questions.filter((q) => responses[q.id] !== undefined).length;
  const isComplete = answeredInInstrument === questions.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-white border border-slate-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDepression ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'
            }`}
          >
            {isDepression ? <HeartPulse className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {answeredInInstrument} / {questions.length} Answered
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div
            key={q.id}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
          >
            <p className="text-sm font-semibold text-slate-800">
              <span className="font-bold text-teal-700 mr-1.5">Q{q.order}.</span>
              {q.text}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RESPONSE_OPTIONS.map((opt) => {
                const selected = responses[q.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onAnswer(q.id, opt.value)}
                    className={`px-3 py-2.5 rounded-xl border text-[11px] font-semibold transition-all text-center ${
                      selected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm scale-[1.01]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="block text-[9px] font-normal opacity-70 mt-0.5">
                      ({opt.value} pts)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ScreenerScreen: React.FC = () => {
  const { setScreen, screenerResponses, answerScreenerQuestion, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'phq9' | 'gad7'>('all');

  const totalQuestions = PHQ9_QUESTIONS.length + GAD7_QUESTIONS.length;
  const answeredCount = Object.keys(screenerResponses).length;
  const complete = isScreenerComplete(screenerResponses);

  // Live scoring
  const phq9Score = scorePHQ9(screenerResponses);
  const gad7Score = scoreGAD7(screenerResponses);

  const handleAutofillDemo = () => {
    // Fill realistic mild-to-moderate clinical responses for quick evaluation
    PHQ9_QUESTIONS.forEach((q, idx) => {
      const demoVal = idx === 0 || idx === 3 ? 2 : idx === 8 ? 0 : 1;
      answerScreenerQuestion(q.id, demoVal);
    });
    GAD7_QUESTIONS.forEach((q, idx) => {
      const demoVal = idx === 0 || idx === 1 ? 2 : 1;
      answerScreenerQuestion(q.id, demoVal);
    });
    showToast('Applied standardized clinical sample responses');
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
      case 'moderately severe':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'mild':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 text-slate-900 space-y-6">
      {/* 4-Stage Assessment Stepper */}
      <AssessmentStepper currentScreen="screener" onNavigate={(scr) => setScreen(scr)} />

      {/* Hero Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Stage 1 of 4: Clinical Screeners</span>
          </div>

          <button
            type="button"
            onClick={handleAutofillDemo}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 text-xs font-semibold transition-all"
            title="Auto-fills sample responses for rapid evaluation"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Auto-fill Sample Answers (Demo)</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Standardized Diagnostic Questionnaires
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
          Over the last 2 weeks, how often have you been bothered by each problem? These standardized
          instruments (PHQ-9 for Depression, GAD-7 for Anxiety) directly calibrate the clinical
          priorities for your AI consultation and diagnostic report.
        </p>

        {/* Live Score Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* PHQ-9 Live Card */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HeartPulse className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">PHQ-9 Depression Index</p>
                <p className="text-[11px] text-slate-500">
                  Total Score: <strong className="text-indigo-700">{phq9Score.total} / 27</strong>
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${getSeverityBadgeClass(
                phq9Score.severity
              )}`}
            >
              {phq9Score.severity}
            </span>
          </div>

          {/* GAD-7 Live Card */}
          <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">GAD-7 Anxiety Index</p>
                <p className="text-[11px] text-slate-500">
                  Total Score: <strong className="text-teal-700">{gad7Score.total} / 21</strong>
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${getSeverityBadgeClass(
                gad7Score.severity
              )}`}
            >
              {gad7Score.severity}
            </span>
          </div>
        </div>

        {/* Overall Completion Progress */}
        <div className="pt-2 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">Questionnaire Progress</span>
            <span className="text-teal-700">
              {answeredCount} / {totalQuestions} answered ({Math.round((answeredCount / totalQuestions) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Tab Filter */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Questions ({totalQuestions})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('phq9')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'phq9'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          PHQ-9 Depression (9)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gad7')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gad7'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          GAD-7 Anxiety (7)
        </button>
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'phq9') && (
          <InstrumentSection
            title="Depression Screener (PHQ-9)"
            subtitle="Patient Health Questionnaire-9 (Validated Clinical Metric)"
            instrumentCode="PHQ-9"
            questions={PHQ9_QUESTIONS}
            responses={screenerResponses}
            onAnswer={answerScreenerQuestion}
          />
        )}

        {(activeTab === 'all' || activeTab === 'gad7') && (
          <InstrumentSection
            title="Anxiety Screener (GAD-7)"
            subtitle="Generalized Anxiety Disorder-7 (Validated Clinical Metric)"
            instrumentCode="GAD-7"
            questions={GAD7_QUESTIONS}
            responses={screenerResponses}
            onAnswer={answerScreenerQuestion}
          />
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm sticky bottom-3 z-20">
        <button
          type="button"
          onClick={() => {
            // Auto-fill unanswered items with baseline 0 if skipped
            SCREENER_QUESTIONS.forEach((q) => {
              if (screenerResponses[q.id] === undefined) {
                answerScreenerQuestion(q.id, 0);
              }
            });
            setScreen('assessment');
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip Screener (Use Baseline)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!complete) {
              SCREENER_QUESTIONS.forEach((q) => {
                if (screenerResponses[q.id] === undefined) {
                  answerScreenerQuestion(q.id, 0);
                }
              });
            }
            setScreen('assessment');
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Continue to Stage 2: AI Voice Consultation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
