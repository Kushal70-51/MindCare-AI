"use client";

const GROUPS = { welcome: 0, login: 0, social_consent: 1, name: 2, intro: 2, profile: 2, face: 3, voice: 4, analyze: 5, report: 6 };
const TOTAL = 7;

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
