# MindSense · Companion

A calm, Siri-style voice companion ("Sage") that guides a user through a
short wellbeing check-in: greeting → self-intro → "I've studied your
profile" → webcam facial step → voice step → generated report.

Built with **Next.js (App Router)** + React. No CSS framework — all styling
lives in `app/globals.css` with design tokens and three switchable orb
themes (Aurora / Ember / Tide).

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

For the camera, mic, and speech to work, the browser needs a **secure
context** — `localhost` counts, and so does any HTTPS deploy. The first
time, the browser will ask for camera/mic permission.

## Project structure

```
app/
  layout.jsx        fonts + <html> shell
  page.jsx          renders <Companion/>
  globals.css       design tokens, orb themes, all component styles
components/
  Companion.jsx     the flow state machine (welcome → … → report)
  Orb.jsx           breathing orb; imperative setMode()/setAmp()
  StepDots.jsx      progress dots
  Toast.jsx         small transient message
  screens/          one component per step of the flow
hooks/
  useSpeech.js      text-to-speech, drives orb + captions
  useMic.js         mic amplitude (with synthetic fallback)
  useCamera.js      webcam feed (with simulated fallback)
```

The orb is animated imperatively (via a ref handle) so the 60fps speech and
mic loops never trigger React re-renders.

## What's real vs. mocked

Real: the full flow, the orb + all its states, text-to-speech, live webcam
feed, live mic waveform + amplitude-reactive orb, theme switching, the
report UI.

Mocked (wire these to your models/backend next):

- **Facial emotion** — `components/screens/FaceStep.jsx` cycles placeholder
  tags. Swap in a real model (e.g. `face-api.js` in the browser, or send
  frames to your backend).
- **Voice emotion** — `hooks/useMic.js` exposes raw amplitude only.
  Send the captured audio to your speech-emotion model instead.
- **Report scores** — `components/screens/Report.jsx` uses a static
  `REPORT` object. Replace with your scoring service output.
- **Share / chat buttons** — currently show a toast. Hook up to your
  referral flow and RAG chatbot.

## Notes

- `reactStrictMode` is off (in `next.config.mjs`) so the assistant's spoken
  sequences don't fire twice in development.
- Respects `prefers-reduced-motion`.
- This is a screening aid, not a diagnostic tool — keep that framing in any
  user-facing copy.
