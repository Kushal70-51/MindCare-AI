"use client";
import { useEffect, useRef, useState } from "react";
import { useMic } from "@/hooks/useMic";

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

const LISTEN_SECONDS = 6;

export default function VoiceStep({ speak, orb, onDone }) {
  const canvasRef = useRef(null);
  const mic = useMic();
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    let raf;
    let stopped = false;
    const hist = new Array(120).fill(0.08);
    const startT = Date.now();
    const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

    const finish = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      mic.stop();
      orb.energy(0);
      orb.mode("");
      onDone("steady, a little tired"); // dummy voice-emotion result
    };

    (async () => {
      await speak(
        "Now, talk to me like I\u2019m that friend who asks a few too many questions.",
        "How has your week actually been \u2014 the honest version?",
        { pitch: 1.05 }
      );
      orb.mode("listening");
      const getAmp = await mic.start();
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      const w = cv.width, h = cv.height;

      const loop = () => {
        if (stopped) return;
        const a = getAmp();
        orb.energy(Math.min(1, a * 1.1));
        hist.push(a);
        hist.shift();

        ctx.clearRect(0, 0, w, h);
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, cssVar("--o1"));
        g.addColorStop(1, cssVar("--o2"));
        ctx.fillStyle = g;
        const bw = w / hist.length;
        hist.forEach((v, i) => {
          const bh = Math.max(3, v * h * 0.9);
          ctx.globalAlpha = 0.55 + v * 0.45;
          roundRect(ctx, i * bw + 1, (h - bh) / 2, bw - 2, bh, 2);
          ctx.fill();
        });

        const s = Math.floor((Date.now() - startT) / 1000);
        setSecs(s);
        if (s >= LISTEN_SECONDS) { finish(); return; }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      mic.stop();
      orb.energy(0);
      orb.mode("");
    };
  }, []);

  return (
    <div className="controls">
      <div className="panel">
        <div className="cam sim" style={{ aspectRatio: "16 / 7" }}>
          <canvas ref={canvasRef} width={600} height={150} style={{ width: "100%", height: "100%" }} />
          <div className="rec"><i /><span>{`Listening ${secs}s`}</span></div>
        </div>
      </div>
      <div className="row">
        <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
          Speak for a few seconds — I’ll stop on my own.
        </span>
      </div>
    </div>
  );
}
