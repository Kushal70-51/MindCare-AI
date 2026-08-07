'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, ArrowRight, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const PrivacyConsentScreen: React.FC = () => {
  const { setScreen, consent, updateConsent, showToast } = useApp();
  const [error, setError] = useState('');

  const handleAccept = () => {
    if (!consent.privacyPolicy || !consent.aiAssessment || !consent.nonMedicalDisclaimer) {
      setError('Please check the required consent boxes to proceed with the assessment.');
      return;
    }
    setError('');
    showToast('Consent accepted. Moving to social media options.');
    setScreen('social');
  };

  const handleDecline = () => {
    showToast('Assessment cancelled due to declined consent.');
    setScreen('welcome');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider"
        >
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Patient Transparency Protocol</span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
          Privacy & Informed Consent
        </h1>

        <p className="text-sm text-slate-300">
          Please review our healthcare data guarantees and confirm your consent preferences before beginning your AI-assisted assessment.
        </p>
      </div>

      {/* 3 Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 space-y-3 shadow-xl"
        >
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 w-fit border border-blue-400/30">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Your Data is Secure</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All audio feeds, transcripts, and biometric facial vectors are processed in an encrypted enclave conforming to HIPAA & ISO 27001 standards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 space-y-3 shadow-xl"
        >
          <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400 w-fit border border-teal-400/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Your Privacy Matters</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We never sell, monetize, or publicly share patient responses with advertisers. You retain the absolute right to wipe your session data anytime.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 space-y-3 shadow-xl bg-amber-950/10"
        >
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 w-fit border border-amber-400/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">AI is Not a Doctor</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            MindCare AI provides clinical decision support and preliminary risk screening. It does not replace a licensed psychiatrist or emergency medical provider.
          </p>
        </motion.div>
      </div>

      {/* Consent Checkboxes Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-6"
      >
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span>Required Informed Consent Checkbox Agreements</span>
        </h3>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={consent.privacyPolicy}
              onChange={(e) => updateConsent({ privacyPolicy: e.target.checked })}
              className="mt-0.5 w-5 h-5 rounded border-slate-700 bg-slate-900 text-teal-400 focus:ring-teal-400"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block mb-0.5">
                1. Privacy Policy & Terms of Service Agreement (Required)
              </span>
              <span className="text-slate-400">
                I agree to the MindCare AI Privacy Policy, data encryption terms, and acceptable use guidelines.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={consent.aiAssessment}
              onChange={(e) => updateConsent({ aiAssessment: e.target.checked })}
              className="mt-0.5 w-5 h-5 rounded border-slate-700 bg-slate-900 text-teal-400 focus:ring-teal-400"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block mb-0.5">
                2. AI-Based Assessment & Speech Analysis Consent (Required)
              </span>
              <span className="text-slate-400">
                I consent to the real-time processing of my speech audio and micro-expressions for mental health screening.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={consent.nonMedicalDisclaimer}
              onChange={(e) => updateConsent({ nonMedicalDisclaimer: e.target.checked })}
              className="mt-0.5 w-5 h-5 rounded border-slate-700 bg-slate-900 text-teal-400 focus:ring-teal-400"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block mb-0.5">
                3. Non-Medical Diagnosis Acknowledgement (Required)
              </span>
              <span className="text-slate-400">
                I understand this assessment generates an algorithmic risk score and does not constitute a formal psychiatric diagnosis.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={consent.socialMediaData}
              onChange={(e) => updateConsent({ socialMediaData: e.target.checked })}
              className="mt-0.5 w-5 h-5 rounded border-slate-700 bg-slate-900 text-teal-400 focus:ring-teal-400"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block mb-0.5">
                4. Social Media Contextual Data Processing (Optional)
              </span>
              <span className="text-slate-400">
                I consent to linking selected social media handles to provide contextual sentiment markers for my SHAP report.
              </span>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleDecline}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Decline & Exit</span>
          </button>

          <button
            onClick={handleAccept}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-xl hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Accept & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
