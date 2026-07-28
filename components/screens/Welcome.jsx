"use client";
import { useEffect } from "react";

export default function Welcome({ orb, showCaption, showSub, onBegin }) {
  useEffect(() => {
    orb.mode("");
    showCaption("Hey \u2014 I\u2019m Sage");
    showSub(
      "Your MindSense companion. Think of me as a friendly doctor who actually has time for you \u2014 a quick, private wellbeing check. (A screening aid, not a diagnosis.)"
    );
  }, []);

  return (
    <div className="controls">
      <button className="btn primary" onClick={onBegin}>Let’s begin</button>
      <div className="row">
        <span style={{ fontSize: 12, color: "var(--ink-faint)", maxWidth: "32ch" }}>
          Camera &amp; mic are used only while you’re here. Nothing is saved in this demo.
        </span>
      </div>
    </div>
  );
}
