"use client";
import { useEffect, useRef } from "react";

// Dummy scores. In production these come from your scoring service,
// combining facial + voice + questionnaire signals.
const REPORT = {
  overall: 72,
  metrics: [
    { label: "Stress", val: 38, signals: ["Voice: some tension", "Face: mostly calm"] },
    { label: "Anxiety", val: 44, signals: ["Steady tone", "No strong cues"] },
    { label: "Mood", val: 68, signals: ["Warm expression", "Positive language"] },
  ],
};

function Metric({ label, val, signals }) {
  const barRef = useRef(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (barRef.current) barRef.current.style.width = val + "%";
    });
    return () => cancelAnimationFrame(id);
  }, [val]);

  return (
    <div className="metric">
      <div className="lab"><b>{label}</b><span>{val}/100</span></div>
      <div className="bar"><span ref={barRef} /></div>
      <div className="signals">
        {signals.map((s, i) => <span className="chip" key={i}>{s}</span>)}
      </div>
    </div>
  );
}

export default function Report({ speak, showCaption, showSub, name, onRestart, showToast }) {
  useEffect(() => {
    showCaption(name ? `${name}, here\u2019s your check-in` : "Here\u2019s your check-in");
    showSub("");
    speak(
      name ? `Okay ${name}, here\u2019s what I found.` : "Okay, here\u2019s what I found.",
      "Your overall wellbeing looks balanced, with a little strain around rest. Nothing alarming \u2014 just worth a gentle check-in.",
      { rate: 0.95 }
    );
  }, []);

  return (
    <div className="controls">
      <div className="report">
        <div className="score">
          <span className="num">{REPORT.overall}</span>
          <span className="of">/100 wellbeing</span>
        </div>
        <div className="verdict">
          <b>Balanced, with a little strain.</b> Mostly steady signals — worth being kind to your rest this week.
        </div>

        {REPORT.metrics.map((m) => (
          <Metric key={m.label} label={m.label} val={m.val} signals={m.signals} />
        ))}

        <div className="row" style={{ marginTop: 24 }}>
          <button className="btn primary" onClick={() => showToast("Report ready to share securely (demo).")}>
            Share with a specialist
          </button>
          <button className="btn" onClick={() => showToast("Sage chat opens here (demo).")}>
            Ask Sage about this
          </button>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={onRestart}>Start over</button>
        </div>

        <p className="note">
          MindSense is a screening aid, not a medical diagnosis. If you’re struggling, please reach out to a qualified professional.
        </p>
      </div>
    </div>
  );
}
