'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  Sparkles,
  Sun,
  Moon,
  Eye,
  Type,
  User,
  Activity,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const {
    screen,
    setScreen,
    user,
    theme,
    setTheme,
    highContrast,
    toggleHighContrast,
    largeFont,
    toggleLargeFont,
  } = useApp();

  const getScreenTitle = () => {
    switch (screen) {
      case 'splash':
        return 'System Overview';
      case 'welcome':
        return 'Welcome Portal';
      case 'register':
        return 'Account Registration';
      case 'login':
        return 'Secure Portal Login';
      case 'consent':
        return 'Privacy & Informed Consent';
      case 'social':
        return 'Social Media Integration';
      case 'dashboard':
        return 'Assessment Dashboard';
      case 'assessment':
        return 'AI Interactive Evaluation';
      case 'completed':
        return 'Session Complete';
      case 'report':
        return 'Explainable AI Clinical Report';
      default:
        return 'Assessment Platform';
    }
  };

  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Brand & Mobile Drawer Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-white/10"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={() => setScreen('welcome')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative p-2 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
                MindCare AI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
            </div>
            <p className="text-[10px] uppercase font-semibold tracking-widest text-teal-400/90 hidden sm:block">
              Clinical SaaS Assessment
            </p>
          </div>
        </div>

        {/* Current Active Section Badge */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
          <Activity className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-300">
            {getScreenTitle()}
          </span>
        </div>
      </div>

      {/* Right Controls: Accessibility & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* High Contrast Toggle */}
        <button
          onClick={toggleHighContrast}
          title={highContrast ? 'Standard Contrast' : 'High Contrast Mode'}
          className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
            highContrast
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-300'
              : 'bg-slate-800/80 border-white/10 text-slate-300 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="hidden xl:inline text-[11px]">
            {highContrast ? 'High Contrast ON' : 'Contrast'}
          </span>
        </button>

        {/* Font Size Toggle */}
        <button
          onClick={toggleLargeFont}
          title={largeFont ? 'Standard Font Size' : 'Large Text Accessibility'}
          className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
            largeFont
              ? 'bg-teal-500 text-white font-bold border-teal-300'
              : 'bg-slate-800/80 border-white/10 text-slate-300 hover:text-white'
          }`}
        >
          <Type className="w-4 h-4" />
          <span className="hidden xl:inline text-[11px]">
            {largeFont ? 'Large Font' : 'Text Size'}
          </span>
        </button>

        {/* Theme Picker */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-950/60 border border-white/10 gap-1">
          <button
            onClick={() => setTheme('calm')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              theme === 'calm'
                ? 'bg-teal-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Calm
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              theme === 'light'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              theme === 'dark'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark
          </button>
        </div>

        {/* User Badge */}
        {user.isLoggedIn ? (
          <div
            onClick={() => setScreen('dashboard')}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-800 border border-white/15 cursor-pointer transition-all"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-7 h-7 rounded-full object-cover border border-teal-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                {user.fullName[0]}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-200 hidden md:inline">
              {user.fullName.split(' ')[0]}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setScreen('login')}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold text-xs hover:shadow-lg hover:shadow-teal-500/20 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
