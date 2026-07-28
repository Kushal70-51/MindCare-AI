"use client";
import { useCallback, useRef } from "react";

/**
 * Webcam capture. start(mountEl) attaches a live <video> into the given
 * DOM element. If camera access is blocked, it drops in a simulated face
 * placeholder instead so the flow never looks broken.
 *
 * NOTE: this only shows the feed. Real facial-emotion analysis would run a
 * model (e.g. face-api.js in the browser, or frames sent to your backend).
 */
export function useCamera() {
  const streamRef = useRef(null);

  const start = useCallback(async (mount) => {
    if (!mount) return false;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = s;
      const v = document.createElement("video");
      v.autoplay = true;
      v.muted = true;
      v.playsInline = true;
      v.srcObject = s;
      mount.appendChild(v);
      return true;
    } catch {
      mount.classList.add("sim");
      const face = document.createElement("div");
      face.className = "sim-face";
      mount.insertBefore(face, mount.firstChild);
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  return { start, stop };
}
