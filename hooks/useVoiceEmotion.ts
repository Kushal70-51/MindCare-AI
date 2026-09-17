'use client';

import { useEffect, useRef } from 'react';
import { classifyAudioEmotion, VoiceEmotionResult } from '../utils/voiceEmotion';

/**
 * Records the user's mic audio for as long as `active` is true (one clip per
 * question — the caller ties `active` to "AI finished asking, now listening"),
 * then classifies the vocal tone once recording stops. `questionId` is
 * captured at the start of each recording so a slow classification can't get
 * misattributed after the app has already moved to the next question.
 */
export function useVoiceEmotion(
  active: boolean,
  questionId: number | undefined,
  onResult: (result: VoiceEmotionResult, questionId: number) => void
) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (!active || questionId === undefined) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

    let cancelled = false;
    const targetQuestionId = questionId;
    const chunks: Blob[] = [];

    navigator.mediaDevices
      // Explicit constraints (rather than bare `audio: true`) so the clip fed
      // to the acoustic model is as clean a capture of the user's actual
      // voice as the hardware allows — echo/noise here otherwise degrades
      // both this classifier's input and, since it's the same physical mic,
      // whatever quality the browser's separate speech-recognition pipeline
      // is getting.
      .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream);
        } catch (err) {
          console.warn('MediaRecorder unavailable for acoustic analysis:', err);
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        recorder.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const result = await classifyAudioEmotion(blob);
          if (result) onResultRef.current(result, targetQuestionId);
        };

        recorder.start();
        recorderRef.current = recorder;
      })
      .catch((err) => {
        console.warn('Mic access for acoustic analysis failed:', err);
      });

    return () => {
      cancelled = true;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch (e) {}
      }
      recorderRef.current = null;
    };
  }, [active, questionId]);
}
