'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { Header } from './layout/Header';
import { Sidebar } from './layout/Sidebar';
import { Toast } from './ui/Toast';

import { SplashScreen } from './screens/SplashScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PrivacyConsentScreen } from './screens/PrivacyConsentScreen';
import { SocialConnectScreen } from './screens/SocialConnectScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ScreenerScreen } from './screens/ScreenerScreen';
import { AssessmentInterfaceScreen } from './screens/AssessmentInterfaceScreen';
import { AssessmentCompletedScreen } from './screens/AssessmentCompletedScreen';
import { ReportScreen } from './screens/ReportScreen';
import { CrisisResourceModal } from './ui/CrisisResourceModal';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { screen, theme, highContrast, largeFont } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen key="splash" />;
      case 'welcome':
        return <WelcomeScreen key="welcome" />;
      case 'register':
        return <RegisterScreen key="register" />;
      case 'login':
        return <LoginScreen key="login" />;
      case 'consent':
        return <PrivacyConsentScreen key="consent" />;
      case 'social':
        return <SocialConnectScreen key="social" />;
      case 'dashboard':
        return <DashboardScreen key="dashboard" />;
      case 'screener':
        return <ScreenerScreen key="screener" />;
      case 'assessment':
        return <AssessmentInterfaceScreen key="assessment" />;
      case 'completed':
        return <AssessmentCompletedScreen key="completed" />;
      case 'report':
        return <ReportScreen key="report" />;
      default:
        return <SplashScreen key="splash" />;
    }
  };

  const isFullStandalone = screen === 'splash' || screen === 'welcome';

  return (
    <div
      className={`min-h-screen bg-[#F4F7F6] text-slate-900 font-sans selection:bg-teal-200 selection:text-teal-900 transition-all ${
        highContrast ? 'high-contrast-mode' : ''
      } ${largeFont ? 'text-lg' : ''}`}
    >
      <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

      <div className="flex w-full">
        {/* Render Sidebar on screens after onboarding/welcome */}
        {!isFullStandalone && (
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
        )}

        <main className="flex-1 w-full min-w-0 overflow-x-hidden min-h-[calc(100vh-65px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toast />
      <CrisisResourceModal />
    </div>
  );
}

export default function Companion() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
