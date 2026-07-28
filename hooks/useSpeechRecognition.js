"use client";
import { useCallback, useRef } from "react";

/**
 * Speech-to-text via the Web Speech API (Chrome/Edge only — no polyfill for
 * other engines). listen() starts a recognition session and auto-stops after
 * a period of silence, so the caller doesn't need a manual "done" trigger
 * (one is still offered in the UI as a fallback).
 */
export function useSpeechRecognition() {
  const recRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const listen = useCallback(({ onInterim, onFinal, silenceMs = 1800 } = {}) => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return () => {};

    const rec = new SR();
    recRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

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
        if (e.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      onInterim?.((finalText + interim).trim());
      resetSilenceTimer();
    };
    rec.onerror = () => {};
    rec.onend = () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(silenceTimer);
      onFinal?.(finalText.trim());
    };

    resetSilenceTimer();
    try {
      rec.start();
    } catch {
      onFinal?.("");
    }

    return () => {
      clearTimeout(silenceTimer);
      try {
        rec.stop();
      } catch {}
    };
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {}
  }, []);

  return { isSupported, listen, stop };
}
