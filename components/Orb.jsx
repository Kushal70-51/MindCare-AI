"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * The companion orb: a glassy sphere with a live, Siri-style frequency
 * waveform painted inside it. It runs its own requestAnimationFrame loop and
 * reads a single "energy" value (0..1), so speech/mic loops can animate it
 * smoothly without triggering React re-renders.
 *
 *   ref.current.setMode("speaking" | "listening" | "thinking" | "")
 *   ref.current.setEnergy(0..1)   // drives waveform height + subtle scale
 */
const Orb = forwardRef(function Orb(_props, ref) {
  const wrapRef = useRef(null);
  const orbRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ mode: "", energy: 0, target: 0 });

  useImperativeHandle(ref, () => ({
    setMode(m) {
      stateRef.current.mode = m || "";
      if (wrapRef.current) wrapRef.current.className = "orb-wrap " + (m || "");
    },
    setEnergy(v) {
      stateRef.current.target = Math.max(0, Math.min(1, v));
    },
  }), []);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    const st = stateRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let t = 0, raf;

    const resize = () => {
      const s = cv.clientWidth || (orbRef.current && orbRef.current.clientWidth) || 200;
      cv.width = s * DPR;
      cv.height = s * DPR;
    };
    const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

    const draw = () => {
      st.energy += (st.target - st.energy) * 0.16;
      const e = st.energy;
      const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, R = W / 2;
      if (orbRef.current) orbRef.current.style.setProperty("--amp", (1 + e * 0.05).toFixed(3));

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.98, 0, Math.PI * 2);
      ctx.clip();

      const cols = [cssVar("--o1"), cssVar("--o2"), cssVar("--o3")];
      const layers = [
        { c: cols[0], amp: 1.0, freq: 1.0, speed: 1.0, ph: 0 },
        { c: cols[1], amp: 0.72, freq: 1.9, speed: -1.5, ph: 1.8 },
        { c: cols[2], amp: 0.5, freq: 3.1, speed: 0.85, ph: 3.6 },
      ];
      const base = (0.05 + e * 0.5) * R;
      ctx.lineWidth = Math.max(1.5, R * 0.022);
      ctx.lineJoin = "round";
      layers.forEach((L, li) => {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const nx = x / W;
          const env = Math.sin(Math.PI * nx);
          const y = cy
            + Math.sin(nx * Math.PI * 2 * L.freq * 3 + t * L.speed + L.ph) * base * L.amp * env
            + Math.sin(nx * Math.PI * 2 * L.freq * 1.7 - t * L.speed * 0.6 + L.ph) * base * 0.32 * L.amp * env;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = L.c;
        ctx.globalAlpha = Math.min(1, 0.5 - li * 0.1 + e * 0.35);
        ctx.shadowBlur = R * 0.05;
        ctx.shadowColor = L.c;
        ctx.stroke();
      });
      ctx.restore();

      t += reduce ? 0 : 0.05 + e * 0.06;
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    requestAnimationFrame(() => { resize(); draw(); });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="orb-wrap" ref={wrapRef}>
      <div className="halo" />
      <div className="orb" ref={orbRef}>
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <canvas className="wave" ref={canvasRef} />
        <div className="glass" />
        <div className="ring" />
        <div className="ring" />
        <div className="ring" />
      </div>
    </div>
  );
});

export default Orb;
