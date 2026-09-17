'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Stethoscope,
  LogOut,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

function riskBadgeColor(risk) {
  switch (risk) {
    case 'High':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Moderate':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/auth/doctor/me');
      const meData = await meRes.json();
      if (!meData.doctor) {
        router.push('/doctor');
        return;
      }
      setDoctor(meData.doctor);

      const reportsRes = await fetch('/api/reports/doctor');
      const reportsData = await reportsRes.json();
      setReports(reportsData.reports || []);
      setLoading(false);
    })();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/doctor/logout', { method: 'POST' });
    router.push('/doctor');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const pendingCount = reports.filter((r) => !r.reviewed).length;

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 font-sans">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-600 text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">MindCare AI Provider Portal</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{doctor?.full_name} · {doctor?.specialty}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Provider
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon={Users} label="Patients Shared" value={reports.length} />
          <StatCard icon={Clock} label="Awaiting Review" value={pendingCount} accent="amber" />
          <StatCard icon={CheckCircle2} label="Reviewed" value={reports.length - pendingCount} accent="emerald" />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Patient Reports</h2>

          {reports.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center text-sm text-slate-500">
              No reports have been shared with you yet. Once a patient shares their assessment, it will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <Link
                  key={r.id}
                  href={`/doctor/dashboard/${r.id}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-black flex items-center justify-center shrink-0">
                      {r.patientName?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{r.patientName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{r.patientEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${riskBadgeColor(r.riskLevel)}`}>
                      {r.riskLevel} Risk
                    </span>
                    <span className="text-xs font-mono text-slate-600 hidden sm:inline">{r.overallScore}/100</span>
                    {!r.reviewed && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        New
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  const color = accent === 'amber' ? 'text-amber-600' : accent === 'emerald' ? 'text-emerald-600' : 'text-teal-600';
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
      <Icon className={`w-4 h-4 ${color}`} />
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500 font-semibold">{label}</p>
    </div>
  );
}
