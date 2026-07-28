"use client";
import { useEffect } from "react";

export default function Intro({ speak, name, onDone }) {
  useEffect(() => {
    (async () => {
      await speak(name ? `Wonderful to meet you, ${name}!` : "Wonderful to meet you!", "", { pitch: 1.1, rate: 1.0 });
      await speak("I\u2019m Sage \u2014 your MindSense companion. A friendly doctor type\u2026 minus the freezing-cold stethoscope.", "", { pitch: 1.06 });
      await speak("Here\u2019s the deal: no needles, nothing scary.", "Just a little chat, a peek at your smile, and the sound of your voice.", { rate: 0.95 });
      onDone();
    })();
  }, []);
  return null;
}
