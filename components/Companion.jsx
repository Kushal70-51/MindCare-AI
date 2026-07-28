"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import Orb from "./Orb";
import StepDots from "./StepDots";
import Toast from "./Toast";
import { useSpeech } from "@/hooks/useSpeech";

import Welcome from "./screens/Welcome";
import NameStep from "./screens/NameStep";
import Intro from "./screens/Intro";
import Profile from "./screens/Profile";
import FaceStep from "./screens/FaceStep";
import VoiceStep from "./screens/VoiceStep";
import Analyze from "./screens/Analyze";
import Report from "./screens/Report";

const THEMES = ["aurora", "ember", "tide"];

export default function Companion() {
  const orbRef = useRef(null);
  const ctx = useRef({ name: "", face: "", voice: "" }); // shared assessment data

  const [step, setStep] = useState("welcome");
  const [caption, setCaption] = useState("Sage");
  const [captionKey, setCaptionKey] = useState(0);
  const [sub, setSub] = useState("");
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState("aurora");

  // stable orb controller — animates via imperative handle, no re-renders
  const orb = useMemo(
    () => ({
      mode: (m) => orbRef.current?.setMode(m),
      energy: (v) => orbRef.current?.setEnergy(v),
    }),
    []
  );

  const showCaption = useCallback((text) => {
    setCaption(text);
    setCaptionKey((k) => k + 1); // remount span so the fade animation replays
  }, []);
  const showSub = useCallback((t) => setSub(t || ""), []);

  const speak = useSpeech(orb, showCaption, showSub);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }, []);

  const go = useCallback((s) => setStep(s), []);

  const setThemeAttr = (t) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  };

  let screen = null;
  switch (step) {
    case "welcome":
      screen = <Welcome orb={orb} showCaption={showCaption} showSub={showSub} onBegin={() => go("name")} />;
      break;
    case "name":
      screen = <NameStep speak={speak} onDone={(n) => { ctx.current.name = n; go("intro"); }} />;
      break;
    case "intro":
      screen = <Intro speak={speak} name={ctx.current.name} onDone={() => go("profile")} />;
      break;
    case "profile":
      screen = <Profile speak={speak} onReady={() => go("face")} />;
      break;
    case "face":
      screen = <FaceStep speak={speak} name={ctx.current.name} onDone={(e) => { ctx.current.face = e; go("voice"); }} />;
      break;
    case "voice":
      screen = <VoiceStep speak={speak} orb={orb} onDone={(e) => { ctx.current.voice = e; go("analyze"); }} />;
      break;
    case "analyze":
      screen = <Analyze orb={orb} showCaption={showCaption} showSub={showSub} onDone={() => go("report")} />;
      break;
    case "report":
      screen = (
        <Report
          speak={speak}
          showCaption={showCaption}
          showSub={showSub}
          name={ctx.current.name}
          showToast={showToast}
          onRestart={() => { ctx.current = { name: "", face: "", voice: "" }; go("welcome"); }}
        />
      );
      break;
    default:
      screen = null;
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="dot" />
          <b>MindSense</b> <span>Companion</span>
        </div>
        <div className="themes" role="group" aria-label="Orb theme">
          {THEMES.map((t) => (
            <button key={t} data-theme={t} aria-pressed={theme === t} onClick={() => setThemeAttr(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main className="stage">
        <Orb ref={orbRef} />
        <div className="caption">
          <span className="fade" key={captionKey}>{caption}</span>
        </div>
        <div className="sub">{sub}</div>
        {screen}
        <StepDots step={step} />
      </main>

      <Toast message={toast} />
    </div>
  );
}
