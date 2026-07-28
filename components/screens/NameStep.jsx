"use client";
import { useEffect, useRef, useState } from "react";

export default function NameStep({ speak, onDone }) {
  const [val, setVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      await speak("Before anything else\u2026 what should I call you?", "", { pitch: 1.08 });
      inputRef.current?.focus();
    })();
  }, []);

  const proceed = () => onDone(val.trim());

  return (
    <div className="controls">
      <input
        ref={inputRef}
        className="name"
        placeholder="Type your name"
        autoComplete="off"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && proceed()}
      />
      <div className="row">
        <button className="btn primary" onClick={proceed}>Continue</button>
        <button className="btn ghost" onClick={() => onDone("")}>Skip</button>
      </div>
    </div>
  );
}
