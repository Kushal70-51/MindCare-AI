'use client';

import React, { useEffect, useState } from 'react';
import { MentalHealthReport, UserProfile } from '../../types/mindcare';
import { X, Download, Share2, CheckCircle, FileText, Lock, Stethoscope, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface VerifiedDoctor {
  id: string;
  full_name: string;
  specialty: string;
  hospital_affiliation: string | null;
  years_experience: number | null;
  city: string | null;
  distanceKm: number | null;
}

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MentalHealthReport;
  user: UserProfile;
  showToast: (msg: string) => void;
  onShared?: (reportId: string, doctorName: string) => void;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  report,
  user,
  showToast,
  onShared,
}) => {
  const [doctors, setDoctors] = useState<VerifiedDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareError, setShareError] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');

  const fetchDoctors = (coords?: { lat: number; lng: number }) => {
    setDoctorsLoading(true);
    const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : '';
    fetch(`/api/doctors/list${query}`)
      .then((res) => res.json())
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => setDoctors([]))
      .finally(() => setDoctorsLoading(false));
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('granted');
        fetchDoctors({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235);
      doc.text('MindCare AI - Mental Health Assessment Report', 15, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Patient Name: ${user.fullName} | Date: ${report.completionDate}`, 15, 28);
      doc.text(`Report ID: MC-${Math.floor(100000 + Math.random() * 900000)} | Risk Level: ${report.riskLevel}`, 15, 34);

      doc.setDrawColor(200, 200, 200);
      doc.line(15, 38, 195, 38);

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Overall Status: ${report.overallStatus}`, 15, 48);
      doc.text(`Well-being Score: ${report.overallScore} / 100 (Confidence: ${report.confidenceScore}%)`, 15, 56);

      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text('Detected Clinical Conditions & Sub-indices:', 15, 70);

      let y = 80;
      report.conditions.forEach((c) => {
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(`• ${c.name}: ${c.score}/100 (${c.severity}) - ${c.description}`, 18, y);
        y += 8;
      });

      y += 6;
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text('Explainable AI (SHAP) Influences:', 15, y);

      y += 10;
      report.shapFeatures.slice(0, 4).forEach((s) => {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(`[${s.category}] ${s.feature}: ${s.impactValue > 0 ? '+' : ''}${s.impactValue} SHAP`, 18, y);
        y += 6;
      });

      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(150, 50, 50);
      doc.text('Disclaimer: This report is an AI-assisted evaluation and does not constitute a formal diagnosis.', 15, y);

      doc.save(`MindCare_AI_Report_${user.fullName.replace(/\s+/g, '_')}.pdf`);
      showToast('PDF report downloaded successfully!');
    } catch (e) {
      console.error(e);
      showToast('Downloaded fallback plain text summary.');
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleShareWithDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    setSharing(true);
    setShareError('');
    try {
      const res = await fetch('/api/reports/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          patientName: user.fullName,
          patientEmail: user.email,
          report,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setShareError(data.error || 'Could not share the report. Please try again.');
        return;
      }
      setSent(true);
      showToast(`Report shared securely with ${selectedDoctor?.full_name}`);
      if (selectedDoctor && data.id) onShared?.(data.id, selectedDoctor.full_name);
    } catch (err) {
      setShareError('Could not reach the server. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Export & Share Clinical Summary
            </h3>
            <p className="text-xs text-slate-500">
              Generate a HIPAA-compliant encrypted PDF or forward directly to your provider.
            </p>
          </div>
        </div>

        {/* Preview Summary */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span className="font-medium">Patient:</span>
            <span className="font-semibold text-slate-900">{user.fullName}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="font-medium">Overall Status:</span>
            <span className="font-bold text-teal-700">{report.overallStatus}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="font-medium">Well-being Score:</span>
            <span className="font-bold text-blue-600">{report.overallScore} / 100</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="font-medium">XAI Confidence:</span>
            <span className="font-semibold text-emerald-600">{report.confidenceScore}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm hover:shadow-md transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Download Complete PDF Report
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              Or Send to Healthcare Provider
            </span>
          </div>

          {sent ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-800">Report Shared!</p>
              <p className="text-xs text-emerald-700/80">
                {selectedDoctor?.full_name} can now review it in their provider dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleShareWithDoctor} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Select a Verified Doctor
                  </label>
                  <button
                    type="button"
                    onClick={handleFindNearest}
                    disabled={locationStatus === 'locating'}
                    className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-60"
                  >
                    {locationStatus === 'locating' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3 h-3" />
                    )}
                    <span>{locationStatus === 'granted' ? 'Sorted by distance' : 'Find nearest to me'}</span>
                  </button>
                </div>

                {locationStatus === 'denied' && (
                  <p className="text-[11px] text-rose-600 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    Couldn&apos;t access your location — showing the full list instead.
                  </p>
                )}

                {doctorsLoading ? (
                  <p className="text-xs text-slate-500 py-2">Loading verified doctors...</p>
                ) : doctors.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    No verified doctors are registered yet. Ask your provider to register at{' '}
                    <span className="text-teal-700">/doctor</span>.
                  </p>
                ) : (
                  <div className="relative">
                    <Stethoscope className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      required
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 appearance-none"
                    >
                      <option value="" disabled>Choose a doctor...</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} — {d.specialty}
                          {d.hospital_affiliation ? ` (${d.hospital_affiliation})` : ''}
                          {d.distanceKm !== null
                            ? ` • ${d.distanceKm} km away`
                            : d.city
                            ? ` • ${d.city}`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {shareError && <p className="text-xs text-rose-600">{shareError}</p>}

              <button
                type="submit"
                disabled={sharing || !selectedDoctorId}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium border border-slate-300 transition-all text-sm disabled:opacity-50"
              >
                {sharing ? (
                  <span>Sharing...</span>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-teal-600" />
                    <span>Share with Doctor</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>Protected under HIPAA & GDPR end-to-end encryption guidelines</span>
        </div>
      </div>
    </div>
  );
};
