'use client';

import React from 'react';
import { ClipboardList, Brain, Sparkles, FileText, Check } from 'lucide-react';
import { ScreenId } from '../../types/mindcare';

interface AssessmentStepperProps {
  currentScreen: ScreenId;
  onNavigate?: (screen: ScreenId) => void;
  className?: string;
}

export const ASSESSMENT_STAGES = [
  {
    id: 'screener' as ScreenId,
    order: 1,
    title: 'Clinical Screener',
    subtitle: 'PHQ-9 & GAD-7 Scales',
    icon: ClipboardList,
  },
  {
    id: 'assessment' as ScreenId,
    order: 2,
    title: 'AI Consultation',
    subtitle: 'Multimodal Dialogue',
    icon: Brain,
  },
  {
    id: 'completed' as ScreenId,
    order: 3,
    title: 'Clinical Synthesis',
    subtitle: 'Biomarkers & XAI',
    icon: Sparkles,
  },
  {
    id: 'report' as ScreenId,
    order: 4,
    title: 'Diagnostic Report',
    subtitle: 'SHAP & Care Plan',
    icon: FileText,
  },
];

export const AssessmentStepper: React.FC<AssessmentStepperProps> = ({
  currentScreen,
  onNavigate,
  className = '',
}) => {
  const currentStageIndex = ASSESSMENT_STAGES.findIndex((s) => s.id === currentScreen);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  return (
    <div
      className={`w-full bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {ASSESSMENT_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isClickable = Boolean(onNavigate) && (isCompleted || isCurrent);

          return (
            <React.Fragment key={stage.id}>
              {/* Step item */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onNavigate?.(stage.id)}
                className={`flex-1 flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-teal-50/80 border border-teal-200 ring-2 ring-teal-500/10'
                    : isCompleted
                    ? 'hover:bg-slate-50 cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Badge / Icon */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-teal-600 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Text details */}
                <div className="min-w-0 hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step {stage.order}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    )}
                  </div>
                  <p
                    className={`text-xs font-bold truncate ${
                      isCurrent
                        ? 'text-teal-900 font-extrabold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate hidden lg:block">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Compact label for small screens */}
                <div className="min-w-0 md:hidden">
                  <p
                    className={`text-[11px] font-bold truncate ${
                      isCurrent ? 'text-teal-900' : 'text-slate-600'
                    }`}
                  >
                    {stage.title}
                  </p>
                </div>
              </button>

              {/* Connector line between steps */}
              {idx < ASSESSMENT_STAGES.length - 1 && (
                <div
                  className={`h-0.5 w-3 sm:w-6 shrink-0 rounded-full transition-colors ${
                    idx < activeIndex ? 'bg-teal-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
