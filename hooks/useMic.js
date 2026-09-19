"use client";
import { useCallback, useRef } from "react";

/**
 * Microphone capture. start() returns a getter that yields the current
 * amplitude (0..1). If mic access is blocked (e.g. sandboxed preview),
 * it falls back to a synthetic signal so the UI still animates.
 *
 * NOTE: this reads raw amplitude only. Real speech-emotion recognition
 * would send the captured audio to your ML model / backend instead.
 */
export function useMic() {
  const streamRef = useRef(null);
  const ctxRef = useRef(null);

  const start = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = s;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(s);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      return () => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const x = (data[i] - 128) / 128;
          sum += x * x;
        }
        return Math.min(1, Math.sqrt(sum / data.length) * 3.2);
      };
    } catch {
      // synthetic fallback
      let t = 0;
      return () => {
        t += 0.12;
        return 0.25 + 0.22 * Math.abs(Math.sin(t * 1.7)) + 0.12 * Math.abs(Math.sin(t * 3.1));
      };
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch {}
      ctxRef.current = null;
    }
  }, []);

  return { start, stop };
}
