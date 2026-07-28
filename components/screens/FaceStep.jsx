"use client";
import { useEffect, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

// Dummy model output for the camera tag. Replace with a real facial-emotion model.
const FACE_EMO = ["Calm", "Neutral", "Slightly tense", "Relaxed", "Focused"];

const MAX_QUESTIONS = 3;

async function askSage(history, name, faceEmotion) {
  const res = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, name, faceEmotion }),
  });
  if (!res.ok) throw new Error(`interview API ${res.status}`);
  return res.json();
}

export default function FaceStep({ speak, name, onDone }) {
  const camRef = useRef(null);
  const camera = useCamera();
  const recognition = useSpeechRecognition();
  const stopListenRef = useRef(() => {});
  const historyRef = useRef([]);
  const moodTagsRef = useRef([]);
  const questionCountRef = useRef(0);
  const emoRef = useRef("detecting…");

  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState("setup"); // setup | listening | thinking | closing
  const [emo, setEmo] = useState("detecting…");
  const [transcript, setTranscript] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");

  useEffect(() => {
    emoRef.current = emo;
  }, [emo]);

  useEffect(() => {
    let emoIv;
    let cancelled = false;

    const finish = () => {
      camera.stop();
      stopListenRef.current();
      const summary = moodTagsRef.current.filter(Boolean).join(", ") || "mostly calm";
      onDone(summary);
    };

    const handleFinalTranscript = async (text) => {
      if (cancelled) return;
      const answer = (text || "").trim() || "(no clear answer was captured)";
      historyRef.current.push({ role: "user", content: answer });
      setTranscript("");
      await runTurn();
    };

    const startListening = () => {
      setPhase("listening");
      setTranscript("");
      if (!recognition.isSupported) return; // fallback UI handles this case
      stopListenRef.current = recognition.listen({
        onInterim: (t) => !cancelled && setTranscript(t),
        onFinal: handleFinalTranscript,
      });
    };

    const runTurn = async () => {
      if (cancelled) return;
      setPhase("thinking");
      let data;
      try {
        data = await askSage(historyRef.current, name, emoRef.current);
      } catch {
        data = {
          reply: "Sorry — I lost my connection for a second there. Let's wrap this part up.",
          mood_tag: "unclear",
          continue_interview: false,
        };
      }
      if (cancelled) return;

      historyRef.current.push({ role: "assistant", content: data.reply });
      moodTagsRef.current.push(data.mood_tag);

      await speak(data.reply, "", { pitch: 1.05 });
      if (cancelled) return;

      if (data.continue_interview) {
        questionCountRef.current += 1;
        if (questionCountRef.current > MAX_QUESTIONS) {
          finish(); // safety net: model tried to go beyond the question budget
        } else {
          startListening();
        }
      } else {
        finish();
      }
    };

    (async () => {
      await speak("Alright — let's do a tiny interview.", "", { pitch: 1.08, rate: 1.0 });
      await speak(
        "I'll switch on your camera to read your expressions, and I'll actually listen to what you say — talk to me like normal.",
        "",
        { rate: 0.97 }
      );
      if (cancelled) return;
      setReady(true);
      await camera.start(camRef.current);
      let i = 0;
      emoIv = setInterval(() => {
        setEmo(FACE_EMO[i % FACE_EMO.length]);
        i++;
      }, 1400);

      historyRef.current = [{ role: "user", content: "Let's begin the check-in." }];
      questionCountRef.current = 0;
      await runTurn();
    })();

    return () => {
      cancelled = true;
      clearInterval(emoIv);
      camera.stop();
      stopListenRef.current();
    };
  }, []);

  const submitTyped = () => {
    const text = typedAnswer.trim();
    setTypedAnswer("");
    stopListenRef.current();
    // Route through the same path as a captured transcript.
    historyRef.current.push({ role: "user", content: text || "(no answer given)" });
    setPhase("thinking");
    (async () => {
      let data;
      try {
        data = await askSage(historyRef.current, name, emoRef.current);
      } catch {
        data = { reply: "Let's continue.", mood_tag: "unclear", continue_interview: false };
      }
      historyRef.current.push({ role: "assistant", content: data.reply });
      moodTagsRef.current.push(data.mood_tag);
      await speak(data.reply, "", { pitch: 1.05 });
      if (data.continue_interview) {
        questionCountRef.current += 1;
      }
      if (data.continue_interview && questionCountRef.current <= MAX_QUESTIONS) {
        setPhase("listening");
      } else {
        camera.stop();
        onDone(moodTagsRef.current.filter(Boolean).join(", ") || "mostly calm");
      }
    })();
  };

  return (
    <div className="controls">
      <div className="panel">
        <div className="cam" ref={camRef}>
          <div className="rec">
            <i /> Reading expression
          </div>
          <div className="tag">
            <i />
            <span>{emo}</span>
          </div>
        </div>
        <div className="q">
          <b>
            {phase === "thinking"
              ? "Sage is thinking…"
              : phase === "listening"
              ? "Your turn — speak freely"
              : "A quick chat"}
          </b>
          <span>
            {phase === "listening"
              ? transcript || (recognition.isSupported ? "I'm listening…" : "")
              : phase === "thinking"
              ? "…"
              : ""}
          </span>
        </div>
      </div>

      {ready && phase === "listening" && !recognition.isSupported && (
        <div className="row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
          <textarea
            className="name"
            placeholder="Your browser can't listen — type your answer instead"
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            rows={2}
          />
          <button className="btn primary" onClick={submitTyped}>
            Send answer
          </button>
        </div>
      )}

      {ready && phase === "listening" && recognition.isSupported && (
        <div className="row">
          <button className="btn ghost" onClick={() => stopListenRef.current()}>
            I'm done answering
          </button>
        </div>
      )}
    </div>
  );
}
