'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types/mindcare';
import {
  LayoutDashboard,
  Brain,
  FileBarChart2,
  Share2,
  ShieldCheck,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { screen, setScreen, logoutUser, user } = useApp();

  const navItems: { id: ScreenId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assessment', label: 'AI Assessment', icon: Brain },
    { id: 'report', label: 'Mental Health Report', icon: FileBarChart2 },
    { id: 'social', label: 'Connected Platforms', icon: Share2 },
    { id: 'consent', label: 'Privacy & Consent', icon: ShieldCheck },
  ];

  const handleNavigate = (id: ScreenId) => {
    setScreen(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 text-white w-64 shadow-2xl">
      {/* Navigation Links */}
      <div className="space-y-6">
        {/* Healthcare Platform Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-900/40 via-teal-900/30 to-slate-900 border border-teal-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>AI Clinical Assistant</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Evidence-Based Multimodal Assessment Framework
          </p>
        </div>

        {/* Section Header */}
        <div>
          <h4 className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            Main Navigation
          </h4>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = screen === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-teal-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-teal-200" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Account Settings & Logout */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 font-bold text-xs flex items-center justify-center">
            {user.fullName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logoutUser();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block h-[calc(100vh-65px)] sticky top-[65px] shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
