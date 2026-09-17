'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Video, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageThread } from './MessageThread';
import { VideoCallModal } from './VideoCallModal';

interface DoctorCommunicationWidgetProps {
  reportId: string;
  doctorName: string;
  patientName: string;
}

// Floating widget for the patient side, mirrors ReportChatbot's placement
// pattern but on the opposite corner so the two don't collide.
export const DoctorCommunicationWidget: React.FC<DoctorCommunicationWidgetProps> = ({
  reportId,
  doctorName,
  patientName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inCall, setInCall] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[min(92vw,380px)] h-[480px] max-h-[70vh] bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-xl bg-blue-600 shrink-0">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-none truncate">{doctorName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Your care provider</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 pt-3 shrink-0">
              <button
                onClick={() => setInCall(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Video className="w-4 h-4" />
                Start Video Call
              </button>
            </div>

            <div className="flex-1 min-h-0 px-4 pb-4 pt-3">
              <MessageThread sharedReportId={reportId} currentSenderType="patient" patientName={patientName} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 h-14 rounded-full bg-blue-600 shadow-lg text-white hover:scale-105 transition-all font-bold text-xs"
        title="Message your doctor"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        <span className="hidden sm:inline">{isOpen ? 'Close' : `Message ${doctorName.split(' ')[0]}`}</span>
      </button>

      {inCall && (
        <VideoCallModal roomId={reportId} displayName={patientName} onClose={() => setInCall(false)} />
      )}
    </div>
  );
};
