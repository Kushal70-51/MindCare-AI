"use client";
import { useEffect, useState } from "react";

export default function Profile({ speak, onReady }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    (async () => {
      await speak("I\u2019ve had a quick look over your profile.", "", { rate: 0.95 });
      await speak("Don\u2019t worry \u2014 only the boring parts. Your secrets are safe with me.", "", { pitch: 1.08 });
      setShow(true);
    })();
  }, []);

  if (!show) return null;
  return (
    <div className="controls">
      <button className="btn primary" onClick={onReady}>I’m ready</button>
    </div>
  );
}
