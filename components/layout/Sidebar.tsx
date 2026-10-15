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
  ClipboardList,
  Home,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { screen, setScreen, logoutUser, user } = useApp();

  interface NavItem {
    id: ScreenId;
    label: string;
    sublabel?: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }

  const mainNavItems: NavItem[] = [
    { id: 'welcome', label: 'Landing Page', sublabel: 'Explore Platform', icon: Home },
    { id: 'dashboard', label: 'Dashboard', sublabel: 'Patient Overview', icon: LayoutDashboard },
  ];

  const assessmentNavItems: NavItem[] = [
    {
      id: 'screener',
      label: 'Stage 1: Clinical Screener',
      sublabel: 'PHQ-9 & GAD-7 Scales',
      icon: ClipboardList,
      badge: 'Step 1',
    },
    {
      id: 'assessment',
      label: 'Stage 2: AI Consultation',
      sublabel: 'Multimodal Voice & Face',
      icon: Brain,
      badge: 'Step 2',
    },
    {
      id: 'report',
      label: 'Stage 4: Diagnostic Report',
      sublabel: 'DSM-5 & SHAP Analysis',
      icon: FileBarChart2,
      badge: 'Dossier',
    },
  ];

  const toolsNavItems: NavItem[] = [
    { id: 'social', label: 'Connected Platforms', sublabel: 'Digital Phenotyping', icon: Share2 },
    { id: 'consent', label: 'Privacy & Consent', sublabel: 'HIPAA & Data Policies', icon: ShieldCheck },
  ];

  const handleNavigate = (id: ScreenId) => {
    setScreen(id);
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div>
      <h4 className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
        {title}
      </h4>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          // When on 'completed' screen, treat 'report' or 'assessment' as active
          const isActive = screen === item.id || (screen === 'completed' && item.id === 'report');

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 text-left">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <p className="truncate leading-tight font-bold">{item.label}</p>
                  {item.sublabel && (
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? 'text-teal-100' : 'text-slate-400'
                      }`}
                    >
                      {item.sublabel}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-teal-700/80 text-teal-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-white border-r border-slate-200 text-slate-900 w-64 shadow-sm">
      {/* Navigation Links */}
      <div className="space-y-5 overflow-y-auto pr-1">
        {/* Healthcare Platform Card */}
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>AI Clinical Assistant</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            4-Stage Multimodal Assessment Framework
          </p>
        </div>

        {/* Group 1: Overview */}
        {renderNavGroup('Overview', mainNavItems)}

        {/* Group 2: Assessment Stages */}
        {renderNavGroup('Assessment Workflow', assessmentNavItems)}

        {/* Group 3: Connected & Privacy */}
        {renderNavGroup('Data & Security', toolsNavItems)}
      </div>

      {/* Footer / Account Settings & Logout */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        {user.isLoggedIn ? (
          <>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 text-teal-700 font-bold text-xs flex items-center justify-center">
                {user.fullName ? user.fullName[0] : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{user.fullName || 'Patient'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs shrink-0">
                G
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-teal-950 leading-tight">Guest Mode</p>
                <p className="text-[10px] text-teal-700 truncate">Tests available without login</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setScreen('login');
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-teal-800 border border-teal-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Sign In / Save Data</span>
            </button>
          </div>
        )}
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
