'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';
const DETECTION_INTERVAL_MS = 1200;

export type FaceEmotionLabel =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'disgusted'
  | 'surprised';

export type FaceEmotionExpressions = Record<FaceEmotionLabel, number>;

export interface FaceEmotionReading {
  dominantEmotion: FaceEmotionLabel;
  expressions: FaceEmotionExpressions;
  confidence: number;
  timestamp: number;
}

// Module-level singleton so the (~600KB) tiny_face_detector + face_expression
// weights are only fetched once, even if multiple components mount the hook.
let modelsLoadPromise: Promise<void> | null = null;

function loadModels(): Promise<void> {
  if (!modelsLoadPromise) {
    modelsLoadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]).then(() => undefined);
  }
  return modelsLoadPromise;
}

/**
 * Runs live facial-expression inference (face-api.js tiny_face_detector +
 * face_expression_model, both pretrained CNNs) against a <video> element.
 * Returns the dominant emotion + full expression probability distribution,
 * refreshed on an interval while `active` is true.
 */
export function useFaceEmotion(videoRef: RefObject<HTMLVideoElement>, active: boolean) {
  const [modelsReady, setModelsReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [reading, setReading] = useState<FaceEmotionReading | null>(null);
  const intervalRef = useRef<number | null>(null);
  const detectingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadModels()
      .then(() => {
        if (!cancelled) setModelsReady(true);
      })
      .catch((err) => {
        console.warn('face-api.js model load failed:', err);
        if (!cancelled) setModelError('Facial model failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active || !modelsReady) return;

    const detect = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || detectingRef.current) return;

      detectingRef.current = true;
      try {
        const result = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          )
          .withFaceExpressions();

        if (result?.expressions) {
          const expressions = result.expressions as unknown as FaceEmotionExpressions;
          let dominant: FaceEmotionLabel = 'neutral';
          let maxScore = 0;
          (Object.keys(expressions) as FaceEmotionLabel[]).forEach((key) => {
            if (expressions[key] > maxScore) {
              maxScore = expressions[key];
              dominant = key;
            }
          });

          setReading({
            dominantEmotion: dominant,
            expressions,
            confidence: maxScore,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        console.warn('Facial expression detection frame skipped:', err);
      } finally {
        detectingRef.current = false;
      }
    };

    detect();
    intervalRef.current = window.setInterval(detect, DETECTION_INTERVAL_MS);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [active, modelsReady, videoRef]);

  return { modelsReady, modelError, reading };
}

const AFFECT_LABELS: Record<FaceEmotionLabel, string> = {
  neutral: 'Calm & Focused',
  happy: 'Positive & Engaged',
  sad: 'Low Mood Indicators',
  angry: 'Tension Detected',
  fearful: 'Anxiety Signals',
  disgusted: 'Discomfort Detected',
  surprised: 'Heightened Alertness',
};

export function describeFaceEmotion(reading: FaceEmotionReading | null): string {
  if (!reading) return 'Calibrating...';
  return AFFECT_LABELS[reading.dominantEmotion];
}
