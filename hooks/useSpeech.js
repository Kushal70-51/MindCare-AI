"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Speaks lines aloud (Web Speech API) with a warmer, more human delivery,
 * while driving the orb's waveform with a speech-like "syllable" cadence and
 * updating the on-screen caption / subtitle.
 *
 * @param orb          controller: { mode(m), energy(v) }
 * @param showCaption  fn(text)
 * @param showSub      fn(text)
 * @returns speak(text, subtext?, opts?) -> Promise
 *          opts: { rate, pitch } to colour individual lines with emotion.
 */
export function useSpeech(orb, showCaption, showSub) {
  const voiceRef = useRef(null);

  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!synth) return;
    const pick = () => {
      const vs = synth.getVoices();
      voiceRef.current =
        vs.find((v) => /samantha|aria|jenny|natural|google uk english female/i.test(v.name)) ||
        vs.find((v) => /female|zira/i.test(v.name)) ||
        vs.find((v) => /en-US|en-GB/i.test(v.lang)) ||
        vs[0] || null;
    };
    pick();
    synth.onvoiceschanged = pick;
    return () => { try { synth.cancel(); } catch {} };
  }, []);

  const est = (t) => Math.max(1600, t.length * 55);

  const speak = useCallback(
    (text, subtext = "", opts = {}) => {
      showCaption(text);
      showSub(subtext);
      orb.mode("speaking");

      return new Promise((resolve) => {
        const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
        let done = false;

        // speech-like energy cadence (pseudo-syllable bursts)
        let ph = Math.random() * 6;
        const iv = setInterval(() => {
          const burst = 0.35 + 0.42 * Math.abs(Math.sin(ph * 3.1)) + 0.22 * Math.random();
          orb.energy(Math.min(1, burst));
          ph += 0.2;
        }, 70);

        const finish = () => {
          if (done) return;
          done = true;
          clearInterval(iv);
          orb.energy(0);
          orb.mode("");
          resolve();
        };

        if (!synth) { setTimeout(finish, est(text)); return; }
        try {
          synth.cancel();
          const u = new SpeechSynthesisUtterance(text);
          if (voiceRef.current) u.voice = voiceRef.current;
          u.rate = opts.rate ?? 0.97;
          u.pitch = opts.pitch ?? 1.05;
          u.onend = finish;
          u.onerror = () => setTimeout(finish, est(text));
          synth.speak(u);
          setTimeout(finish, est(text) + 3000); // safety net
        } catch {
          setTimeout(finish, est(text));
        }
      });
    },
    [orb, showCaption, showSub]
  );

  return speak;
}
