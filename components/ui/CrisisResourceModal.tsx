'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartHandshake, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CRISIS_RESOURCES } from '../../utils/crisisDetection';

export const CrisisResourceModal: React.FC = () => {
  const { crisisFlag, dismissCrisisFlag } = useApp();

  return (
    <AnimatePresence>
      {crisisFlag && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            className="w-full max-w-md bg-white border border-rose-200 rounded-3xl shadow-xl p-6 space-y-5"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <HeartHandshake className="w-7 h-7 text-rose-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">You're not alone in this</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                It sounds like you might be going through something really difficult right now. Please
                consider reaching out to one of the support lines below — trained people are ready to listen,
                any time.
              </p>
            </div>

            <div className="space-y-2.5">
              {CRISIS_RESOURCES.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{r.name}</p>
                      <p className="text-[10px] text-slate-500">{r.hours}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700 whitespace-nowrap">{r.contact}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              This screening tool is not an emergency service. If you are in immediate danger, please
              contact local emergency services.
            </p>

            <button
              onClick={dismissCrisisFlag}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              I'm safe — continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
