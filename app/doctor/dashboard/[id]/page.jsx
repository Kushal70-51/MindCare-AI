'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Activity,
  Quote,
  CheckCircle2,
  Save,
  ShieldCheck,
  Mail,
  Calendar,
  MessageSquare,
  Video,
} from 'lucide-react';
import { MessageThread } from '../../../../components/ui/MessageThread';
import { VideoCallModal } from '../../../../components/ui/VideoCallModal';

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

function severityColor(sev) {
  switch (sev) {
    case 'Severe':
      return 'text-rose-700 bg-rose-50 border-rose-200';
    case 'Moderate':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Mild':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    default:
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  }
}

export default function DoctorReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/auth/doctor/me');
      const meData = await meRes.json();
      if (!meData.doctor) {
        router.push('/doctor');
        return;
      }
      setDoctor(meData.doctor);

      const res = await fetch(`/api/reports/doctor/${params.id}`);
      if (!res.ok) {
        router.push('/doctor/dashboard');
        return;
      }
      const d = await res.json();
      setData(d);
      setNotes(d.doctorNotes || '');
      setReviewed(d.reviewed);
      setLoading(false);
    })();
  }, [params.id, router]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/reports/doctor/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewed, doctorNotes: notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const { report, patientName, patientEmail, sharedAt } = data;

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 font-sans">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/doctor/dashboard" className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">{patientName}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> {patientEmail}
              <span className="mx-1">·</span>
              <Calendar className="w-3 h-3" /> Shared {new Date(sharedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Status</span>
            <p className="text-sm font-black text-teal-700">{report.overallStatus}</p>
            <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Well-being Index</span>
              <span className="font-mono font-bold text-slate-900">{report.overallScore} / 100</span>
            </div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Risk Level</span>
            <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full border ${riskBadgeColor(report.riskLevel)}`}>
              {report.riskLevel} Risk
            </span>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">XAI Confidence</span>
            <p className="text-xl font-black text-emerald-600 font-mono">{report.confidenceScore}%</p>
          </div>
        </div>

        {/* Conditions */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Detected Conditions & Clinical Sub-indices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.conditions.map((c, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${severityColor(c.severity)}`}>
                    {c.severity} ({c.score}/100)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${c.score}%` }} />
                </div>
                <p className="text-xs text-slate-500">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Quote className="w-4 h-4 text-teal-600" />
            Supporting Evidence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.retrievedEvidence.map((ev) => (
              <div key={ev.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                  <span className="text-teal-700">{ev.source}</span>
                  <span>{ev.timestamp}</span>
                </div>
                <p className="text-slate-700 italic">{ev.quote}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Patient communication */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              Message {patientName}
            </h3>
            <button
              onClick={() => setInCall(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Video className="w-3.5 h-3.5" />
              Start Video Call
            </button>
          </div>
          <div className="h-72">
            <MessageThread sharedReportId={params.id} currentSenderType="doctor" />
          </div>
        </div>

        {/* Clinician notes */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Clinician Review
          </h3>

          <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 bg-white text-teal-600"
            />
            Mark as reviewed
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add private clinical notes about this patient's report..."
            rows={5}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-none"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save Notes'}
          </button>
        </div>
      </main>

      {inCall && (
        <VideoCallModal
          roomId={params.id}
          displayName={doctor?.full_name || 'Doctor'}
          onClose={() => setInCall(false)}
        />
      )}
    </div>
  );
}
