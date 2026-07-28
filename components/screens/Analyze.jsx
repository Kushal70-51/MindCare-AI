"use client";
import { useEffect } from "react";

export default function Analyze({ orb, showCaption, showSub, onDone }) {
  useEffect(() => {
    orb.mode("thinking");
    orb.energy(0.32);
    showCaption("Right, let me piece this together\u2026");
    showSub("");
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const t = setTimeout(() => {
      orb.mode("");
      orb.energy(0);
      onDone();
    }, reduce ? 600 : 2600);
    return () => clearTimeout(t);
  }, []);
  return null;
}
