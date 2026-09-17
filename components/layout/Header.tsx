'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  Eye,
  Type,
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
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Brand & Mobile Drawer Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={() => setScreen('welcome')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative p-2 rounded-2xl bg-teal-600 text-white shadow-sm group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                MindCare AI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[10px] uppercase font-semibold tracking-widest text-teal-700 hidden sm:block">
              Clinical SaaS Assessment
            </p>
          </div>
        </div>

        {/* Current Active Section Badge */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
          <Activity className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-semibold text-slate-500">
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
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
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
              ? 'bg-teal-600 text-white font-bold border-teal-600'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
          }`}
        >
          <Type className="w-4 h-4" />
          <span className="hidden xl:inline text-[11px]">
            {largeFont ? 'Large Font' : 'Text Size'}
          </span>
        </button>

        {/* Theme Picker */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
          <button
            onClick={() => setTheme('calm')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              theme === 'calm'
                ? 'bg-white text-teal-700 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Calm
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              theme === 'light'
                ? 'bg-white text-blue-700 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              theme === 'dark'
                ? 'bg-white text-indigo-700 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dark
          </button>
        </div>

        {/* User Badge */}
        {user.isLoggedIn ? (
          <div
            onClick={() => setScreen('dashboard')}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-7 h-7 rounded-full object-cover border border-teal-500"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                {user.fullName[0]}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-700 hidden md:inline">
              {user.fullName.split(' ')[0]}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setScreen('login')}
            className="px-4 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
