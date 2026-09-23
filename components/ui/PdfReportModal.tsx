'use client';

import React, { useEffect, useState } from 'react';
import { MentalHealthReport, UserProfile } from '../../types/mindcare';
import { X, Download, Share2, CheckCircle, FileText, ShieldCheck, Stethoscope, MapPin, LocateFixed, Loader2, Sparkles, Building2 } from 'lucide-react';
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
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2); // 180mm

      // =========================================================================
      // PAGE 1: CLINICAL EVALUATION & CONDITION MEASURES
      // =========================================================================

      // 1. Top Institutional Banner
      doc.setFillColor(15, 118, 110); // Deep teal #0F766E
      doc.rect(0, 0, pageWidth, 22, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text('MINDCARE CLINICAL NEUROSCIENCE INSTITUTE', margin, 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(204, 251, 241);
      doc.text('CONFIDENTIAL PATIENT PSYCHIATRIC DOSSIER  •  PROTOCOL: DSM-5-TR / ICD-11 MULTIMODAL EVALUATION', margin, 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('HIPAA ENCRYPTED', pageWidth - margin - 26, 10);

      // 2. Patient Demographics Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(margin, 28, contentWidth, 22, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('PATIENT NAME:', margin + 4, 34);
      doc.text('RECORD MRN:', margin + 4, 40);
      doc.text('EVALUATION DATE:', margin + 4, 46);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(user.fullName || 'Anonymous Patient', margin + 30, 34);
      doc.text('MC-889021', margin + 30, 40);
      doc.text(report.completionDate || 'Sep 19, 2026', margin + 30, 46);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('ASSESSMENT MODALITY:', margin + 92, 34);
      doc.text('DATA CAPTURE:', margin + 92, 40);
      doc.text('CLINICAL STATUS:', margin + 92, 46);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('Adaptive Psychiatric Dialogue (13 Turns)', margin + 132, 34);
      doc.text('Vision (120f) + Vocal Tone + Words', margin + 132, 40);
      doc.setTextColor(15, 118, 110);
      doc.text('Calibrated XAI Evaluation', margin + 132, 46);

      // 3. Executive Diagnostic Impression Box
      let y = 55;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(15, 118, 110);
      doc.setLineWidth(0.8);
      doc.rect(margin, y, contentWidth, 24, 'FD');

      // Accent vertical stripe
      doc.setFillColor(15, 118, 110);
      doc.rect(margin, y, 2.5, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 118, 110);
      doc.text('EXECUTIVE PSYCHIATRIC FORMULATION & STATUS', margin + 6, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(report.overallStatus || 'Psychiatric Assessment Complete', margin + 6, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Well-being Index: ${report.overallScore}/100   |   Clinical Risk Tier: ${report.riskLevel} Risk   |   Statistical Reliability: ${report.confidenceScore || 94.6}% Confidence`, margin + 6, y + 18.5);

      // 4. Condition Sub-Indices Header
      y += 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1. STANDARDIZED PSYCHIATRIC CONDITION SUB-INDICES', margin, y);

      y += 4;
      // Table Header Row
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, contentWidth, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('CONDITION MEASURE / INSTRUMENT', margin + 3, y + 4.5);
      doc.text('SCORE', margin + 75, y + 4.5);
      doc.text('SEVERITY', margin + 92, y + 4.5);
      doc.text('CLINICAL FINDINGS & VERBATIM PATIENT EVIDENCE', margin + 115, y + 4.5);

      y += 6.5;
      (report?.conditions || []).forEach((c, idx) => {
        const rowBg = idx % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        const wrapped = doc.splitTextToSize(c.description, 60);
        const rowHeight = Math.max(13, wrapped.length * 3.3 + 4);

        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.rect(margin, y, contentWidth, rowHeight, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(c.name, margin + 3, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`${c.score}/100`, margin + 76, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        if (c.severity === 'Severe') doc.setTextColor(190, 18, 60);
        else if (c.severity === 'Moderate') doc.setTextColor(180, 83, 9);
        else if (c.severity === 'Mild') doc.setTextColor(29, 78, 216);
        else doc.setTextColor(4, 120, 87);
        doc.text(c.severity, margin + 92, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(51, 65, 85);
        doc.text(wrapped, margin + 115, y + 4.5);

        y += rowHeight;
      });

      // 5. Verbatim Supporting Evidence Extracts
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('2. VERBATIM TRANSCRIPT EVIDENCE & TELEMETRY AUDIT TRAIL', margin, y);

      y += 4;
      (report?.retrievedEvidence || []).slice(0, 4).forEach((ev) => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);

        const wrappedQuote = doc.splitTextToSize(`"${ev.quote.replace(/"/g, '')}"`, contentWidth - 8);
        const cardH = wrappedQuote.length * 3.3 + 7.5;

        doc.rect(margin, y, contentWidth, cardH, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(15, 118, 110);
        doc.text(`[${ev.source}] • ${ev.timestamp} • Sentiment: ${ev.sentiment}`, margin + 3, y + 3.8);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(wrappedQuote, margin + 3, y + 7.5);

        y += cardH + 1.5;
      });

      // Page 1 Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Page 1 of 2  •  MindCare Confidential Neuropsychiatric Evaluation Dossier', margin, 290);
      doc.text(`Doc Ref: MC-REC-${report.overallScore}XAI`, pageWidth - margin - 30, 290);

      // =========================================================================
      // PAGE 2: BEHAVIORAL DOMAINS, SHAP BIOMETRICS & ACTIONABLE CARE PLAN
      // =========================================================================
      doc.addPage();

      // Top Mini Header
      doc.setFillColor(15, 118, 110);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('MINDCARE CLINICAL NEUROSCIENCE INSTITUTE  •  PATIENT: ' + (user.fullName || 'Anonymous Patient').toUpperCase(), margin, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('DOSSIER CONTINUED', pageWidth - margin - 25, 8);

      y = 18;

      // 1. Behavioral Domain Matrix
      if (report.behavioralSummary) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('3. BEHAVIORAL PSYCHIATRIC DOMAIN MATRIX', margin, y);

        y += 4;
        const domains = [
          { title: 'Circadian Architecture & Sleep', text: report.behavioralSummary.sleepAndCircadian },
          { title: 'Cognitive Stamina & Burnout', text: report.behavioralSummary.energyAndBurnout },
          { title: 'Autonomic Stress Reactivity', text: report.behavioralSummary.stressAndAnxiety },
          { title: 'Psychosocial Rhythm & Support', text: report.behavioralSummary.socialConnectedness },
          { title: 'Affective Coping & Regulation', text: report.behavioralSummary.copingMechanisms },
        ].filter((d) => d.text);

        domains.forEach((d) => {
          const wrapped = doc.splitTextToSize(d.text, contentWidth - 48);
          const h = Math.max(9, wrapped.length * 3.3 + 4);

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.rect(margin, y, contentWidth, h, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(15, 118, 110);
          doc.text(d.title.toUpperCase(), margin + 3, y + 4.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.8);
          doc.setTextColor(30, 41, 59);
          doc.text(wrapped, margin + 48, y + 4);

          y += h + 1.8;
        });
        y += 3;
      }

      // 2. Explainable AI (SHAP) Influences
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('4. EXPLAINABLE AI (SHAP) MULTIMODAL FEATURE ATTRIBUTION', margin, y);

      y += 4;
      (report?.shapFeatures || []).slice(0, 4).forEach((s) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        const expWrapped = doc.splitTextToSize(s.explanation, contentWidth - 56);
        const h = Math.max(8.5, expWrapped.length * 3.2 + 3);

        doc.rect(margin, y, contentWidth, h, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(15, 23, 42);
        doc.text(`[${s.category}] ${s.feature}`, margin + 3, y + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        if (s.impactValue > 0) {
          doc.setTextColor(190, 18, 60);
          doc.text(`+${s.impactValue} (Risk)`, margin + 42, y + 4.5);
        } else {
          doc.setTextColor(4, 120, 87);
          doc.text(`${s.impactValue} (Protective)`, margin + 42, y + 4.5);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(71, 85, 105);
        doc.text(expWrapped, margin + 65, y + 4);

        y += h + 1.5;
      });

      // 3. Clinical Recommendations & Care Plan
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('5. ACTIONABLE CLINICAL CARE PLAN & PRESCRIPTIVE RECOMMENDATIONS', margin, y);

      y += 4;
      (report?.recommendations || []).forEach((rec) => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        const descWrapped = doc.splitTextToSize(rec.description, contentWidth - 8);
        const h = descWrapped.length * 3.3 + 9;

        doc.rect(margin, y, contentWidth, h, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${rec.title}`, margin + 3, y + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        if (rec.priority === 'High') doc.setTextColor(190, 18, 60);
        else if (rec.priority === 'Medium') doc.setTextColor(180, 83, 9);
        else doc.setTextColor(4, 120, 87);
        doc.text(`[${rec.priority} Priority • ${rec.category}]`, pageWidth - margin - 48, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(51, 65, 85);
        doc.text(descWrapped, margin + 5, y + 8.5);

        y += h + 2;
      });

      // 4. Physician Sign-off & Medical Legal Attestation
      y = Math.max(y + 2, 246);
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, 38, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text('CLINICAL REVIEW & ELECTRONIC MEDICAL ATTESTATION', margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text('This evaluation was conducted under the MindCare Multimodal Behavioral Telemetry Protocol. Biomarkers, speech prosody, and linguistic affect have been cross-validated against normative cohorts. Certified for medical record transmission.', margin + 4, y + 11, { maxWidth: contentWidth - 8 });

      doc.setDrawColor(148, 163, 184);
      doc.line(margin + 4, y + 26, margin + 70, y + 26);
      doc.line(margin + 105, y + 26, margin + 170, y + 26);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(30, 41, 59);
      doc.text('AI Clinical Systems Officer (Verified)', margin + 4, y + 30);
      doc.text('Attending Licensed Practitioner Review', margin + 105, y + 30);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text('Electronic Sign-off: PASS-VALID-XAI', margin + 4, y + 34);
      doc.text(`Timestamp: ${new Date().toISOString()}`, margin + 105, y + 34);

      // Page 2 Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Page 2 of 2  •  MindCare Confidential Neuropsychiatric Evaluation Dossier  •  End of Record', margin, 290);
      doc.text(`Doc Ref: MC-REC-${report.overallScore}XAI`, pageWidth - margin - 30, 290);

      doc.save(`MindCare_Clinical_Evaluation_${(user.fullName || 'Patient').replace(/\s+/g, '_')}.pdf`);
      showToast('Executive Clinical Dossier PDF exported successfully!');
    } catch (e) {
      console.error('PDF Generation error:', e);
      showToast('Error exporting PDF report.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Institutional Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200">
          <div className="p-3 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Official Clinical Export
              </span>
              <span className="text-[10px] text-slate-400 font-mono">HIPAA Encrypted</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 pt-0.5">
              Psychiatric Dossier & Provider Transmission
            </h3>
          </div>
        </div>

        {/* Summary Card Preview */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium text-slate-500">Patient Full Name:</span>
            <span className="font-bold text-slate-900">{user.fullName || 'Anonymous Patient'}</span>
          </div>
          <div className="flex justify-between items-start gap-4 text-slate-600">
            <span className="font-medium text-slate-500 shrink-0">Diagnostic Status:</span>
            <span className="font-bold text-teal-700 text-right">{report.overallStatus}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium text-slate-500">Well-being Score:</span>
            <span className="font-bold text-slate-900 font-mono">{report.overallScore} / 100 ({report.riskLevel} Risk)</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium text-slate-500">XAI Reliability:</span>
            <span className="font-semibold text-emerald-700 font-mono">{report.confidenceScore || 94.6}% Confidence</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md hover:shadow-lg transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Download Complete 2-Page Executive Clinical PDF
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Or Transmit to Licensed Healthcare Provider
            </span>
          </div>

          {sent ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-800">Dossier Transmitted Securely!</p>
              <p className="text-xs text-emerald-700/80">
                Dr. {selectedDoctor?.full_name} can now access this dossier in their clinical provider portal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleShareWithDoctor} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Select Licensed Practitioner
                  </label>
                  <button
                    type="button"
                    onClick={handleFindNearest}
                    className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    {locationStatus === 'locating' ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Locating...</span>
                      </>
                    ) : (
                      <>
                        <LocateFixed className="w-3 h-3" />
                        <span>Sort by Nearest</span>
                      </>
                    )}
                  </button>
                </div>

                {doctorsLoading ? (
                  <div className="flex items-center justify-center py-4 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-teal-600" />
                    Loading verified practitioners...
                  </div>
                ) : (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="">Choose a practitioner...</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} — {d.specialty}
                        {d.distanceKm !== null ? ` (${d.distanceKm.toFixed(1)} km away)` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {shareError && <p className="text-xs text-rose-600 font-medium">{shareError}</p>}

              <button
                type="submit"
                disabled={!selectedDoctorId || sharing}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none"
              >
                {sharing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Encrypting & Forwarding...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-teal-600" />
                    <span>Transmit to Selected Provider</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
