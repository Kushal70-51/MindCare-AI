'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Loader2,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Paperclip,
  ArrowRight,
} from 'lucide-react';

function StatusBadge({ status }) {
  if (status === 'verified')
    return (
      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit">
        <CheckCircle2 className="w-3 h-3" /> Verified
      </span>
    );
  if (status === 'rejected')
    return (
      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1 w-fit">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  return (
    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 w-fit">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

export default function AdminPage() {
  const [passcode, setPasscode] = useState('');
  const [authed, setAuthed] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadDoctors = async (code) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/doctors', { headers: { 'x-admin-passcode': code } });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Invalid passcode.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDoctors(data.doctors);
      setAuthed(true);
    } catch (err) {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    loadDoctors(passcode);
  };

  const handleVerify = async (id) => {
    await fetch(`/api/admin/doctors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-passcode': passcode },
      body: JSON.stringify({ action: 'verify' }),
    });
    loadDoctors(passcode);
  };

  const submitReject = async (id) => {
    await fetch(`/api/admin/doctors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-passcode': passcode },
      body: JSON.stringify({ action: 'reject', rejectionReason: rejectReason }),
    });
    setRejectingId(null);
    setRejectReason('');
    loadDoctors(passcode);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] text-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleUnlock} className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Admin Verification Panel</h1>
          <p className="text-xs text-slate-500">Enter the admin passcode to review doctor applications.</p>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Admin passcode"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Unlock</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    );
  }

  const pending = doctors.filter((d) => d.verification_status === 'pending');
  const others = doctors.filter((d) => d.verification_status !== 'pending');

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 font-sans">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h1 className="text-sm font-bold text-slate-900">Doctor Verification Admin Panel</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Pending Applications ({pending.length})</h2>
          {pending.length === 0 && (
            <p className="text-sm text-slate-500 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              No pending applications.
            </p>
          )}
          {pending.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{d.full_name}</p>
                  <p className="text-xs text-slate-500">{d.email}</p>
                </div>
                <StatusBadge status={d.verification_status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <InfoItem label="License #" value={d.license_number} />
                <InfoItem label="Specialty" value={d.specialty} />
                <InfoItem label="Hospital" value={d.hospital_affiliation || '—'} />
                <InfoItem label="Experience" value={d.years_experience ? `${d.years_experience} yrs` : '—'} />
              </div>

              {d.certificate_data && (
                <a
                  href={d.certificate_data}
                  download={d.certificate_filename}
                  className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:underline"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  View uploaded certificate ({d.certificate_filename})
                </a>
              )}

              {rejectingId === d.id ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => submitReject(d.id)} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
                      Confirm Reject
                    </button>
                    <button onClick={() => setRejectingId(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleVerify(d.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(d.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold border border-slate-200"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">All Other Doctors ({others.length})</h2>
          {others.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-slate-900">{d.full_name}</p>
                <p className="text-xs text-slate-500">{d.email} · {d.specialty}</p>
              </div>
              <StatusBadge status={d.verification_status} />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</p>
      <p className="text-slate-700 font-medium truncate">{value}</p>
    </div>
  );
}
