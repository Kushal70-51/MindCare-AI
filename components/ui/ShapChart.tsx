'use client';

import React from 'react';
import { ShapFeatureImpact } from '../../types/mindcare';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShapChartProps {
  features: ShapFeatureImpact[];
}

export const ShapChart: React.FC<ShapChartProps> = ({ features }) => {
  const sorted = [...features].sort((a, b) => Math.abs(b.impactValue) - Math.abs(a.impactValue));

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              SHAP AI Feature Explainability Matrix
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300">
              XAI Transparent Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quantifies how specific audio acoustics, linguistic sentiment, and self-reports influenced your mental health index.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Protective Factor (-)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
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
              className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200 group-hover:text-teal-300 transition-colors">
                    {item.feature}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 font-mono">
                    {item.formattedValue}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {item.category}
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      isProtective ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {item.impactValue > 0 ? `+${item.impactValue.toFixed(2)}` : item.impactValue.toFixed(2)} SHAP
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="mt-2.5 w-full bg-slate-950/60 rounded-full h-3 relative overflow-hidden flex items-center">
                {/* Center Baseline Indicator */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500/50 z-10" />

                {isProtective ? (
                  /* Protective Bar (Left side) */
                  <div className="w-1/2 flex justify-end">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${absPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                      className="h-2.5 rounded-l-full bg-gradient-to-l from-emerald-400 to-teal-500 shadow-[0_0_10px_#22c55e]"
                    />
                  </div>
                ) : (
                  /* Distress Bar (Right side) */
                  <div className="w-1/2 flex justify-start pl-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${absPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                      className="h-2.5 rounded-r-full bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_10px_#f59e0b]"
                    />
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-2 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>{item.explanation}</span>
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
