"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Ensures browser speech synthesis voices are populated.
 * Resolves immediately if voices already exist, or waits for onvoiceschanged.
 */
function getVoicesAsync() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const vs = window.speechSynthesis.getVoices();
    if (vs && vs.length > 0) {
      resolve(vs);
      return;
    }
    let resolved = false;
    const onVoices = () => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.onvoiceschanged = onVoices;
    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices() || []);
    }, 1200);
  });
}

/**
 * Helper to match the most appropriate TTS voice for the requested language.
 */
function pickBestVoice(voices, langCode = "en-IN") {
  if (!voices || voices.length === 0) return { voice: null, actualLang: langCode };

  const norm = langCode.toLowerCase();

  // Hindi: hi-IN
  if (norm.startsWith("hi")) {
    const hiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        /hindi|हिन्दी|kalpana|hemant|swara|madhur|ananya/i.test(v.name)
    );
    if (hiVoice) {
      return { voice: hiVoice, actualLang: hiVoice.lang || "hi-IN" };
    }
  }

  // Marathi: mr-IN
  if (norm.startsWith("mr")) {
    const mrVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("mr") ||
        /marathi|मराठी|aarohi/i.test(v.name)
    );
    if (mrVoice) {
      return { voice: mrVoice, actualLang: mrVoice.lang || "mr-IN" };
    }
    // Marathi fallback to Hindi Devanagari voice
    const hiFallback = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        /hindi|हिन्दी|kalpana|hemant|swara|madhur/i.test(v.name)
    );
    if (hiFallback) {
      console.warn("[useSpeech] Native Marathi voice not found in OS. Falling back to Hindi Devanagari voice:", hiFallback.name);
      return { voice: hiFallback, actualLang: hiFallback.lang || "hi-IN" };
    }
  }

  // English: en-IN / en-GB / en-US
  const enIn = voices.find(
    (v) =>
      v.lang.toLowerCase() === "en-in" ||
      /india|neerja|ravi|prabhat/i.test(v.name)
  );
  if (enIn) return { voice: enIn, actualLang: enIn.lang || "en-IN" };

  const enNatural = voices.find(
    (v) =>
      /samantha|aria|jenny|natural|google uk english female/i.test(v.name) ||
      /female|zira/i.test(v.name) ||
      /en-US|en-GB/i.test(v.lang)
  );
  if (enNatural) return { voice: enNatural, actualLang: enNatural.lang || "en-US" };

  return { voice: voices[0] || null, actualLang: voices[0]?.lang || langCode };
}

/**
 * Speaks lines aloud (Web Speech API) with human delivery,
 * while driving the orb's waveform with speech-like cadence and
 * updating on-screen captions.
 *
 * @param orb          controller: { mode(m), energy(v) }
 * @param showCaption  fn(text)
 * @param showSub      fn(text)
 * @returns speak(text, subtext?, opts?) -> Promise
 *          opts: { rate, pitch, lang }
 */
export function useSpeech(orb, showCaption, showSub) {
  const voicesCacheRef = useRef([]);

  useEffect(() => {
    getVoicesAsync().then((vs) => {
      voicesCacheRef.current = vs;
    });
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch {}
      }
    };
  }, []);

  const est = (t) => Math.max(1600, (t || "").length * 65);

  const speak = useCallback(
    async (text, subtext = "", opts = {}) => {
      showCaption(text);
      showSub(subtext);
      orb.mode("speaking");

      const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
      if (!synth || !text) {
        return new Promise((r) => {
          setTimeout(() => {
            orb.energy(0);
            orb.mode("");
            r();
          }, est(text));
        });
      }

      // Ensure voices are loaded
      let voices = voicesCacheRef.current;
      if (!voices || voices.length === 0) {
        voices = await getVoicesAsync();
        voicesCacheRef.current = voices;
      }

      return new Promise((resolve) => {
        let done = false;

        // speech-like energy cadence
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

        try {
          synth.cancel();

          const u = new SpeechSynthesisUtterance(text);
          const lang = opts.lang || "en-IN";
          const { voice: matchedVoice, actualLang } = pickBestVoice(voices, lang);

          if (matchedVoice) {
            u.voice = matchedVoice;
          }
          u.lang = actualLang;
          u.rate = opts.rate ?? 0.95;
          u.pitch = opts.pitch ?? 1.0;

          u.onend = finish;
          u.onerror = (e) => {
            console.warn("[useSpeech] Utterance error:", e);
            setTimeout(finish, est(text));
          };

          synth.speak(u);
          setTimeout(finish, est(text) + 3500); // safety net
        } catch (err) {
          console.warn("[useSpeech] Speak exception:", err);
          setTimeout(finish, est(text));
        }
      });
    },
    [orb, showCaption, showSub]
  );

  return speak;
}
