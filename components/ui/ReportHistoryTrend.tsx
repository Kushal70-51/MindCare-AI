'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ReportHistoryEntry } from '../../types/mindcare';

interface ReportHistoryTrendProps {
  history: ReportHistoryEntry[];
}

const RISK_COLOR: Record<ReportHistoryEntry['riskLevel'], string> = {
  Low: '#10b981', // emerald — good
  Moderate: '#f59e0b', // amber — warning
  High: '#e34948', // rose/red — critical
};

const CHART_W = 600;
const CHART_H = 160;
const PAD_X = 16;
const PAD_Y = 18;

export const ReportHistoryTrend: React.FC<ReportHistoryTrendProps> = ({ history }) => {
  if (history.length === 0) return null;

  const plotW = CHART_W - PAD_X * 2;
  const plotH = CHART_H - PAD_Y * 2;

  const points = history.map((entry, i) => {
    const x = history.length === 1 ? PAD_X + plotW / 2 : PAD_X + (i / (history.length - 1)) * plotW;
    const y = PAD_Y + plotH - (entry.overallScore / 100) * plotH;
    return { x, y, entry };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-teal-600" />
        <span>Well-being Trend Across Sessions</span>
      </h3>

      {history.length === 1 ? (
        <p className="text-xs text-slate-500">
          This is your first completed session. Complete another assessment later to see how your
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
              <circle key={i} cx={p.x} cy={p.y} r={5} fill={RISK_COLOR[p.entry.riskLevel]} stroke="#ffffff" strokeWidth={2}>
                <title>
                  {new Date(p.entry.date).toLocaleDateString()} — Score {p.entry.overallScore}/100 ({p.entry.riskLevel} risk)
                  {p.entry.phq9Total !== undefined ? ` — PHQ-9: ${p.entry.phq9Total}` : ''}
                  {p.entry.gad7Total !== undefined ? ` — GAD-7: ${p.entry.gad7Total}` : ''}
                </title>
              </circle>
            ))}
          </svg>
        </div>
      )}

      {/* Accessible table fallback / detail view */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-1.5 pr-4 font-semibold">Date</th>
              <th className="py-1.5 pr-4 font-semibold">Well-being Score</th>
              <th className="py-1.5 pr-4 font-semibold">Risk Level</th>
              <th className="py-1.5 pr-4 font-semibold">PHQ-9</th>
              <th className="py-1.5 font-semibold">GAD-7</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, i) => (
              <tr key={i} className="border-b border-slate-100 text-slate-600">
                <td className="py-1.5 pr-4">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="py-1.5 pr-4 font-mono">{entry.overallScore}/100</td>
                <td className="py-1.5 pr-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_COLOR[entry.riskLevel] }} />
                    {entry.riskLevel}
                  </span>
                </td>
                <td className="py-1.5 pr-4 font-mono">{entry.phq9Total ?? '—'}</td>
                <td className="py-1.5 font-mono">{entry.gad7Total ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
