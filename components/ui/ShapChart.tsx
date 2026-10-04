'use client';

import React from 'react';
import { ShapFeatureImpact } from '../../types/mindcare';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShapChartProps {
  features: ShapFeatureImpact[];
}

export const ShapChart: React.FC<ShapChartProps> = ({ features }) => {
  const safeFeatures = Array.isArray(features) ? features : [];
  const sorted = [...safeFeatures].sort((a, b) => Math.abs(b?.impactValue || 0) - Math.abs(a?.impactValue || 0));

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              SHAP AI Feature Explainability Matrix
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700">
              XAI Transparent Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quantifies how specific audio acoustics, linguistic sentiment, and self-reports influenced your mental health index.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Protective Factor (-)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Distress Contributor (+)</span>
          </div>
        </div>
      </div>

      {/* Feature Rows */}
      <div className="mt-5 space-y-4">
        {sorted.map((item, index) => {
          const isProtective = item.impactValue < 0;
          const absPercentage = Math.min(100, Math.abs(item.impactValue) * 180);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                    {item.feature}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">
                    {item.formattedValue}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {item.category}
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      isProtective ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {item.impactValue > 0 ? `+${item.impactValue.toFixed(2)}` : item.impactValue.toFixed(2)} SHAP
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="mt-2.5 w-full bg-white border border-slate-200 rounded-full h-3 relative overflow-hidden flex items-center">
                {/* Center Baseline Indicator */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 z-10" />

                {isProtective ? (
                  /* Protective Bar (Left side) */
                  <div className="w-1/2 flex justify-end">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${absPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                      className="h-2.5 rounded-l-full bg-emerald-500"
                    />
                  </div>
                ) : (
                  /* Distress Bar (Right side) */
                  <div className="w-1/2 flex justify-start pl-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${absPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                      className="h-2.5 rounded-r-full bg-amber-500"
                    />
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{item.explanation}</span>
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
