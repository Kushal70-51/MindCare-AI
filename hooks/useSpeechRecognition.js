"use client";
import { useCallback, useRef } from "react";

/**
 * Speech-to-text via the Web Speech API with multilingual support,
 * accurate interim/final differentiation, and auto-recovery from transient errors.
 */
export function useSpeechRecognition() {
  const recRef = useRef(null);
  const activeRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const listen = useCallback(({ onInterim, onFinal, silenceMs = 2800, lang = "en-IN" } = {}) => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return () => {};

    // Stop any existing instance
    if (recRef.current) {
      try {
        recRef.current.abort();
      } catch {}
      recRef.current = null;
    }

    const rec = new SR();
    recRef.current = rec;
    activeRef.current = true;

    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    let finalText = "";
    let silenceTimer = null;
    let stopped = false;

    const resetSilenceTimer = () => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        try {
          rec.stop();
        } catch {}
      }, silenceMs);
    };

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += (finalText ? " " : "") + t.trim();
        } else {
          interim += t;
        }
      }
      const combined = (finalText + (finalText && interim ? " " : "") + interim).trim();
      onInterim?.(combined, interim.trim(), finalText.trim());
      resetSilenceTimer();
    };

    rec.onerror = (err) => {
      const errType = err?.error;
      if (errType === "no-speech") {
        // Keep listening or restart if dropped
        return;
      }
      if (errType === "aborted") {
        return;
      }
      console.warn("[useSpeechRecognition] STT error:", errType);
      if (errType === "network" && activeRef.current && !stopped) {
        setTimeout(() => {
          if (activeRef.current && !stopped) {
            try { rec.start(); } catch {}
          }
        }, 500);
      }
    };

    rec.onend = () => {
      if (stopped || !activeRef.current) return;
      if (!finalText.trim()) {
        // Safe restart if no speech was captured yet
        setTimeout(() => {
          if (activeRef.current && !stopped) {
            try { rec.start(); } catch {}
          }
        }, 150);
        return;
      }
      stopped = true;
      clearTimeout(silenceTimer);
      onFinal?.(finalText.trim());
    };

    resetSilenceTimer();
    try {
      rec.start();
    } catch (startErr) {
      console.warn("[useSpeechRecognition] Start error:", startErr);
    }

    return () => {
      activeRef.current = false;
      stopped = true;
      clearTimeout(silenceTimer);
      try {
        rec.stop();
      } catch {}
      recRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    activeRef.current = false;
    try {
      recRef.current?.stop();
    } catch {}
    recRef.current = null;
  }, []);

  return { isSupported, listen, stop };
}
