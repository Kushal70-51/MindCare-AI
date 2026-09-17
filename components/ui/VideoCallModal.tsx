'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Video, Loader2 } from 'lucide-react';

interface VideoCallModalProps {
  roomId: string;
  displayName: string;
  onClose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

const JITSI_SCRIPT_SRC = 'https://meet.jit.si/external_api.js';

function loadJitsiScript(): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${JITSI_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (window.JitsiMeetExternalAPI) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Jitsi script')));
      return;
    }
    const script = document.createElement('script');
    script.src = JITSI_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Jitsi script'));
    document.body.appendChild(script);
  });
}

// Embedded via Jitsi Meet's official External API (not a raw iframe) — this
// gives proper load/join lifecycle events (so we can show real connection
// status instead of a blank frame), lets us disable branding/mobile-app
// nags, and cleanly disposes the underlying media session on close instead
// of leaving a stray iframe (and camera/mic lock) behind.
export const VideoCallModal: React.FC<VideoCallModalProps> = ({ roomId, displayName, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const [status, setStatus] = useState<'connecting' | 'joined' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState('');

  const roomName = `mindcareai-${roomId}`.replace(/[^a-zA-Z0-9-]/g, '');

  useEffect(() => {
    let cancelled = false;

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;

        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName,
          width: '100%',
          height: '100%',
          parentNode: containerRef.current,
          userInfo: { displayName },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          },
        });
        apiRef.current = api;

        api.addListener('videoConferenceJoined', () => {
          if (!cancelled) setStatus('joined');
        });
        api.addListener('readyToClose', () => {
          if (!cancelled) onClose();
        });
        api.addListener('errorOccurred', (e: any) => {
          console.warn('Jitsi error:', e);
          if (!cancelled) {
            setStatus('error');
            setErrorMessage('The video call ran into a problem. Please close and try again.');
          }
        });
      })
      .catch((err) => {
        console.warn('Failed to load Jitsi Meet:', err);
        if (!cancelled) {
          setStatus('error');
          setErrorMessage('Could not load the video call — please check your internet connection and try again.');
        }
      });

    return () => {
      cancelled = true;
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (e) {}
        apiRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  const handleClose = () => {
    if (apiRef.current) {
      try {
        apiRef.current.executeCommand('hangup');
      } catch (e) {}
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Video className="w-4 h-4 text-teal-400" />
          <span>Video Consultation</span>
          {status === 'connecting' && <span className="text-[11px] font-normal text-slate-400">Connecting...</span>}
        </div>
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
        >
          <X className="w-3.5 h-3.5" />
          End Call
        </button>
      </div>

      <div className="flex-1 relative">
        {status === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm z-10 bg-slate-950">
            <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
            <span>Connecting to video call...</span>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center text-rose-400 text-sm px-8 text-center z-10 bg-slate-950">
            {errorMessage}
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
