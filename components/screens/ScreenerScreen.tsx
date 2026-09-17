'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, RESPONSE_OPTIONS, isScreenerComplete } from '../../utils/screeners';
import { ClipboardList, ShieldCheck, ArrowRight, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

const InstrumentSection: React.FC<{
  title: string;
  subtitle: string;
  questions: typeof PHQ9_QUESTIONS;
  responses: Record<string, number>;
  onAnswer: (id: string, value: number) => void;
}> = ({ title, subtitle, questions, responses, onAnswer }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>

    <div className="space-y-3">
      {questions.map((q) => (
        <div key={q.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">
            {q.order}. {q.text}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RESPONSE_OPTIONS.map((opt) => {
              const selected = responses[q.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onAnswer(q.id, opt.value)}
                  className={`px-2.5 py-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                    selected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ScreenerScreen: React.FC = () => {
  const { setScreen, screenerResponses, answerScreenerQuestion } = useApp();

  const totalQuestions = PHQ9_QUESTIONS.length + GAD7_QUESTIONS.length;
  const answeredCount = Object.keys(screenerResponses).length;
  const complete = isScreenerComplete(screenerResponses);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 text-slate-900 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Validated Clinical Screener</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">PHQ-9 & GAD-7 Questionnaire</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Over the last 2 weeks, how often have you been bothered by each of the following problems?
          These are the same standardized questionnaires used in clinical practice — your answers directly
          set your depression and anxiety scores in the report, no guesswork involved.
        </p>

        <div className="pt-2 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">Progress</span>
            <span className="text-teal-700">{answeredCount} / {totalQuestions}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      <InstrumentSection
        title="Depression Screener (PHQ-9)"
        subtitle="Patient Health Questionnaire-9"
        questions={PHQ9_QUESTIONS}
        responses={screenerResponses}
        onAnswer={answerScreenerQuestion}
      />

      <InstrumentSection
        title="Anxiety Screener (GAD-7)"
        subtitle="Generalized Anxiety Disorder-7"
        questions={GAD7_QUESTIONS}
        responses={screenerResponses}
        onAnswer={answerScreenerQuestion}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-4">
        <button
          onClick={() => setScreen('assessment')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-semibold transition-all"
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip for Now</span>
        </button>

        <button
          onClick={() => setScreen('assessment')}
          disabled={!complete}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Continue to Voice Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
