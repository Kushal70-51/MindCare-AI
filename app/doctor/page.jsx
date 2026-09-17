'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  BadgeCheck,
  Building2,
  Award,
  Upload,
  ArrowRight,
  LogIn,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  LocateFixed,
} from 'lucide-react';

const SPECIALTIES = [
  'Psychiatrist',
  'Clinical Psychologist',
  'Licensed Therapist / Counselor',
  'General Physician',
  'Neurologist',
  'Other Mental Health Professional',
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DoctorPortalPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    specialty: SPECIALTIES[0],
    hospitalAffiliation: '',
    yearsExperience: '',
    city: '',
    latitude: null,
    longitude: null,
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRegisterForm((p) => ({
          ...p,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLocating(false);
      },
      (err) => {
        // Surface the real reason instead of a generic message — on Windows
        // this is very often PERMISSION_DENIED because the OS-level
        // Location toggle (Settings > Privacy & Security > Location) is off,
        // not because the browser itself was denied.
        let message = 'Could not access your location. You can still register without it.';
        if (err.code === err.PERMISSION_DENIED) {
          message =
            'Location access was blocked. Check the lock/location icon in the address bar, or on Windows: Settings > Privacy & Security > Location must be turned on for your browser.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Your device could not determine a location right now. Try again in a moment.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Try again.';
        }
        console.warn('Geolocation error:', err.code, err.message);
        setLocationError(message);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }
      router.push('/doctor/dashboard');
    } catch (err) {
      setError('Could not reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!certificateFile) {
      setError('Please upload your medical license or certification document.');
      return;
    }

    setIsSubmitting(true);
    try {
      const certificateData = await fileToBase64(certificateFile);
      const res = await fetch('/api/auth/doctor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registerForm,
          certificateFilename: certificateFile.name,
          certificateData,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }
      setRegisterSuccess(true);
    } catch (err) {
      setError('Could not reach the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-900 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-teal-600 text-white shadow-md">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MindCare AI — Provider Portal</h1>
          <p className="text-xs text-slate-500">For licensed clinicians reviewing patient-shared reports.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6 border border-slate-200">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setRegisterSuccess(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'login' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
                setRegisterSuccess(false);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'register' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field icon={Mail} label="Email Address" type="email" required
                value={loginForm.email} onChange={(v) => setLoginForm((p) => ({ ...p, email: v }))} placeholder="dr.sharma@hospital.org" />
              <Field icon={Lock} label="Password" type="password" required
                value={loginForm.password} onChange={(v) => setLoginForm((p) => ({ ...p, password: v }))} placeholder="••••••••" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm disabled:opacity-60 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {mode === 'register' && !registerSuccess && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field icon={User} label="Full Name" required value={registerForm.fullName}
                onChange={(v) => setRegisterForm((p) => ({ ...p, fullName: v }))} placeholder="Dr. Priya Sharma" />
              <Field icon={Mail} label="Email Address" type="email" required value={registerForm.email}
                onChange={(v) => setRegisterForm((p) => ({ ...p, email: v }))} placeholder="dr.sharma@hospital.org" />

              <div className="grid grid-cols-2 gap-3">
                <Field icon={Lock} label="Password" type="password" required value={registerForm.password}
                  onChange={(v) => setRegisterForm((p) => ({ ...p, password: v }))} placeholder="Min. 8 characters" />
                <Field icon={Lock} label="Confirm Password" type="password" required value={registerForm.confirmPassword}
                  onChange={(v) => setRegisterForm((p) => ({ ...p, confirmPassword: v }))} placeholder="Repeat password" />
              </div>

              <Field icon={BadgeCheck} label="Medical License / Registration Number" required value={registerForm.licenseNumber}
                onChange={(v) => setRegisterForm((p) => ({ ...p, licenseNumber: v }))} placeholder="e.g. MCI-123456" />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Specialty</label>
                <select
                  value={registerForm.specialty}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, specialty: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field icon={Building2} label="Hospital / Clinic" value={registerForm.hospitalAffiliation}
                  onChange={(v) => setRegisterForm((p) => ({ ...p, hospitalAffiliation: v }))} placeholder="Optional" />
                <Field icon={Award} label="Years of Experience" type="number" value={registerForm.yearsExperience}
                  onChange={(v) => setRegisterForm((p) => ({ ...p, yearsExperience: v }))} placeholder="Optional" />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Practice Location
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="City / Area (e.g. Andheri, Mumbai)"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-60 ${
                      registerForm.latitude
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'bg-slate-50 border-slate-300 text-slate-600 hover:border-teal-400'
                    }`}
                  >
                    {locating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5" />
                    )}
                    <span>{registerForm.latitude ? 'Located' : 'Use My Location'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Lets patients near you see your practice ranked by distance when choosing a provider.
                </p>
                {locationError && <p className="text-[10px] text-rose-600 mt-1">{locationError}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  License / Certification Document
                </label>
                <label className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-600 cursor-pointer hover:border-teal-400 transition-all">
                  <Upload className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{certificateFile ? certificateFile.name : 'Upload PDF or image (max 2MB) — required for verification'}</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                Your account will be reviewed manually by an administrator before you can sign in.
                This confirms your credentials are genuine before you can access patient-shared reports.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm disabled:opacity-60 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Submit for Verification</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {registerSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-800">Registration Submitted</p>
              <p className="text-xs text-emerald-700/80 leading-relaxed">
                Your account is pending admin verification. You'll be able to sign in once your credentials are approved.
              </p>
              <button
                onClick={() => { setMode('login'); setRegisterSuccess(false); }}
                className="mt-2 text-xs font-bold text-teal-700 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-5">
          Not a clinician? <a href="/" className="text-teal-700 hover:underline">Go to the patient portal</a>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = 'text', required, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
        />
      </div>
    </div>
  );
}
