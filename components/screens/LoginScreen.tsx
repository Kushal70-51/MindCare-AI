'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Stethoscope, Sparkles, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginScreen: React.FC = () => {
  const { setScreen, loginUser, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      loginUser(data.user);
      setScreen('consent');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 mb-1">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Healthcare Portal Sign In</h2>
          <p className="text-xs text-slate-500">
            Access your encrypted AI mental health assessment records.
          </p>
        </div>

        {/* Guest Take-Test Option (No Login Needed) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 border border-teal-200/90 space-y-2 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-teal-900">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Take Test Without Logging In</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            You don't need an account to take the standardized clinical screeners (PHQ-9 &amp; GAD-7) and AI voice consultation.
          </p>
          <button
            type="button"
            onClick={() => setScreen('screener')}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Continue as Guest &amp; Start Free Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Or sign in to your saved account
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 bg-white text-teal-600 focus:ring-teal-400"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => showToast('Password reset link sent to your registered email.')}
              className="text-teal-600 font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all"
          >
            <span>Login to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            Or continue with OAuth
          </span>
        </div>

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/google/login';
            }}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Link to Register */}
        <div className="text-center pt-2 border-t border-slate-200 text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => setScreen('register')}
            className="font-bold text-teal-700 hover:underline"
          >
            Register Now
          </button>
        </div>

        {/* Link to clinician portal */}
        <Link
          href="/doctor"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all"
        >
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          <span>Are you a doctor? Sign in to the Provider Portal</span>
        </Link>
      </motion.div>
    </div>
  );
};
