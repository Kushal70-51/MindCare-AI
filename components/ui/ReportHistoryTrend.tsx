'use client';

import React from 'react';
import { TrendingUp, Eye, FileText } from 'lucide-react';
import { ReportHistoryEntry } from '../../types/mindcare';
import { useApp } from '../../context/AppContext';

interface ReportHistoryTrendProps {
  history: ReportHistoryEntry[];
}

const RISK_COLOR: Record<string, string> = {
  Optimal: '#10b981',
  Minimal: '#10b981',
  Low: '#10b981', // emerald — good
  Moderate: '#f59e0b', // amber — warning
  High: '#e34948', // rose/red — critical
};

const CHART_W = 600;
const CHART_H = 160;
const PAD_X = 16;
const PAD_Y = 18;

export const ReportHistoryTrend: React.FC<ReportHistoryTrendProps> = ({ history }) => {
  const { loadPastReport } = useApp();

  if (!history || history.length === 0) return null;

  const plotW = CHART_W - PAD_X * 2;
  const plotH = CHART_H - PAD_Y * 2;

  const points = history.map((entry, i) => {
    const x = history.length === 1 ? PAD_X + plotW / 2 : PAD_X + (i / (history.length - 1)) * plotW;
    const y = PAD_Y + plotH - ((entry.overallScore || 0) / 100) * plotH;
    return { x, y, entry };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <span>Past Assessment Reports & Longitudinal Trend</span>
        </h3>
        <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          <span>{history.length} Record{history.length > 1 ? 's' : ''} Saved</span>
        </span>
      </div>

      {history.length === 1 ? (
        <p className="text-xs text-slate-500">
          This is your first completed session saved in the database. Complete another assessment later to see how your
          well-being index trends over time.
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full min-w-[420px]" role="img" aria-label="Well-being score trend across sessions">
            {/* Gridlines */}
            {[0, 25, 50, 75, 100].map((v) => {
              const y = PAD_Y + plotH - (v / 100) * plotH;
              return (
                <line key={v} x1={PAD_X} y1={y} x2={CHART_W - PAD_X} y2={y} stroke="#e2e8f0" strokeWidth={1} />
              );
            })}
            {/* Line */}
            <path d={linePath} fill="none" stroke="#0d9488" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {/* Points, colored by risk level */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={6}
                fill={RISK_COLOR[p.entry.riskLevel] || '#10b981'}
                stroke="#ffffff"
                strokeWidth={2}
                className="cursor-pointer hover:r-8 transition-all"
                onClick={() => loadPastReport(p.entry)}
              >
                <title>
                  Click to view report from {new Date(p.entry.date).toLocaleDateString()} — Score {p.entry.overallScore}/100 ({p.entry.riskLevel} risk)
                </title>
              </circle>
            ))}
          </svg>
        </div>
      )}

      {/* Accessible table fallback / detail view */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-4 font-semibold">Assessment Date</th>
              <th className="py-2 pr-4 font-semibold">Well-being Score</th>
              <th className="py-2 pr-4 font-semibold">Risk Profile</th>
              <th className="py-2 pr-4 font-semibold">PHQ-9</th>
              <th className="py-2 pr-4 font-semibold">GAD-7</th>
              <th className="py-2 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, i) => (
              <tr key={i} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors">
                <td className="py-2.5 pr-4 font-medium">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="py-2.5 pr-4 font-mono font-bold">{entry.overallScore}/100</td>
                <td className="py-2.5 pr-4">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_COLOR[entry.riskLevel] || '#10b981' }} />
                    {entry.riskLevel}
                  </span>
                </td>
                <td className="py-2.5 pr-4 font-mono">{entry.phq9Total ?? '—'}</td>
                <td className="py-2.5 pr-4 font-mono">{entry.gad7Total ?? '—'}</td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={() => loadPastReport(entry)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs border border-teal-200 transition-all shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Report</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
