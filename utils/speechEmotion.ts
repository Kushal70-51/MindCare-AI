// Real linguistic-emotion classification for spoken/typed assessment answers.
// Runs fully client-side via transformers.js (ONNX Runtime Web) — no backend,
// no API key. Model: a transformers.js ONNX port of j-hartmann's
// emotion-english-distilroberta-base, a widely used pretrained 7-class
// emotion classifier (trained on Twitter/Reddit/GoEmotions/ISEAR/etc.).
//
// Loaded from the jsDelivr CDN at runtime (native browser `import()`, marked
// `webpackIgnore` so Next.js never tries to bundle it) instead of the npm


// package: onnxruntime-web's minified WASM/WebGPU bundles use syntax
// (top-level `import.meta`) that webpack's bundler cannot parse regardless
// of how the package is aliased — this sidesteps that entirely and matches
// how transformers.js is used in production elsewhere.
const TRANSFORMERS_CDN_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';
const MODEL_ID = 'nicky48/emotion-english-distilroberta-base-ONNX';

export type LinguisticEmotionLabel =
  | 'anger'
  | 'disgust'
  | 'fear'
  | 'joy'
  | 'neutral'
  | 'sadness'
  | 'surprise';

export interface SpeechEmotionResult {
  label: LinguisticEmotionLabel;
  score: number;
  allScores: Record<string, number>;
}

type Classifier = (text: string, options?: Record<string, unknown>) => Promise<Array<{ label: string; score: number }>>;

let classifierPromise: Promise<Classifier> | null = null;

function getClassifier(): Promise<Classifier> {
  if (!classifierPromise) {
    classifierPromise = import(/* webpackIgnore: true */ TRANSFORMERS_CDN_URL).then(({ pipeline, env }) => {
      // Browser-only: never try to resolve models from a local filesystem path.
      env.allowLocalModels = false;
      return pipeline('text-classification', MODEL_ID, { dtype: 'q8' }) as unknown as Promise<Classifier>;
    });
  }
  return classifierPromise;
}

/** Classifies free-text into one of 7 emotions. Returns null on empty input or failure. */
export async function classifyTextEmotion(text: string): Promise<SpeechEmotionResult | null> {
  const trimmed = text.trim();
  if (trimmed.length < 3) return null;

  try {
    const classifier = await getClassifier();
    const output = await classifier(trimmed, { top_k: 7 });
    if (!output || output.length === 0) return null;

    const sorted = [...output].sort((a, b) => b.score - a.score);
    const allScores: Record<string, number> = {};
    sorted.forEach((o) => {
      allScores[o.label] = o.score;
    });

    return {
      label: sorted[0].label as LinguisticEmotionLabel,
      score: sorted[0].score,
      allScores,
    };
  } catch (err) {
    console.warn('Text emotion classification failed:', err);
    return null;
  }
}

const NEGATIVE_LABELS: LinguisticEmotionLabel[] = ['sadness', 'fear', 'anger', 'disgust'];

export function isNegativeEmotion(label: string): boolean {
  return (NEGATIVE_LABELS as string[]).includes(label);
}

/** Maps the model's 7 emotion classes onto the report's existing sentiment scale. */
export function mapEmotionToSentiment(
  label: string,
  score: number
): 'Positive' | 'Calm' | 'Neutral' | 'Mild Distress' | 'High Distress' {
  switch (label) {
    case 'joy':
      return 'Positive';
    case 'neutral':
      return 'Calm';
    case 'surprise':
      return 'Neutral';
    case 'sadness':
    case 'fear':
    case 'anger':
      return score > 0.55 ? 'High Distress' : 'Mild Distress';
    case 'disgust':
      return 'Mild Distress';
    default:
      return 'Neutral';
  }
}
