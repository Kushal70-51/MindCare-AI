"use client";

const GROUPS = { welcome: 0, name: 0, intro: 1, profile: 1, face: 2, voice: 3, analyze: 4, report: 5 };
const TOTAL = 6;

export default function StepDots({ step }) {
  const on = GROUPS[step] ?? 0;
  return (
    <div className="steps">
      {Array.from({ length: TOTAL }).map((_, i) => (
        <i key={i} className={i === on ? "on" : ""} />
      ))}
    </div>
  );
}
