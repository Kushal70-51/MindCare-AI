// Real acoustic (vocal-tone) emotion classification — analyzes HOW something
// was said (pitch, prosody, tone captured in the raw audio waveform), not
// the words themselves (that's utils/speechEmotion.ts). Runs fully
// client-side via transformers.js, loaded from the CDN at runtime (see the
// note in speechEmotion.ts for why — npm-bundling onnxruntime-web breaks
// Next.js's webpack parser regardless of aliasing).
const TRANSFORMERS_CDN_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';
const MODEL_ID = 'onnx-community/wav2vec2-base-Speech_Emotion_Recognition-ONNX';

export type VoiceEmotionLabel = 'SAD' | 'ANGRY' | 'DISGUST' | 'FEAR' | 'HAPPY' | 'NEUTRAL';

export interface VoiceEmotionResult {
  label: VoiceEmotionLabel;
  score: number;
  allScores: Record<string, number>;
}

type Classifier = (audio: string, options?: Record<string, unknown>) => Promise<Array<{ label: string; score: number }>>;

let classifierPromise: Promise<Classifier> | null = null;

function getClassifier(): Promise<Classifier> {
  if (!classifierPromise) {
    classifierPromise = import(/* webpackIgnore: true */ TRANSFORMERS_CDN_URL).then(({ pipeline, env }) => {
      env.allowLocalModels = false;
      return pipeline('audio-classification', MODEL_ID, { dtype: 'q8' }) as unknown as Promise<Classifier>;
    });
  }
  return classifierPromise;
}

const MIN_BLOB_BYTES = 4000; // skip near-silent / accidental recordings

/** Classifies the vocal tone of a recorded answer clip. Null on failure or too-short audio. */
export async function classifyAudioEmotion(blob: Blob): Promise<VoiceEmotionResult | null> {
  if (!blob || blob.size < MIN_BLOB_BYTES) return null;

  const url = URL.createObjectURL(blob);
  try {
    const classifier = await getClassifier();
    const output = await classifier(url, { top_k: 6 });
    if (!output || output.length === 0) return null;

    const sorted = [...output].sort((a, b) => b.score - a.score);
    const allScores: Record<string, number> = {};
    sorted.forEach((o) => {
      allScores[o.label] = o.score;
    });

    return {
      label: sorted[0].label as VoiceEmotionLabel,
      score: sorted[0].score,
      allScores,
    };
  } catch (err) {
    console.warn('Acoustic emotion classification failed:', err);
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const NEGATIVE_LABELS: VoiceEmotionLabel[] = ['SAD', 'ANGRY', 'DISGUST', 'FEAR'];

export function isNegativeVoiceEmotion(label: string): boolean {
  return (NEGATIVE_LABELS as string[]).includes(label);
}
