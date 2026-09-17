import { ScreenerQuestion, ScreenerResult } from '../types/mindcare';

// PHQ-9 (Patient Health Questionnaire-9) and GAD-7 (Generalized Anxiety
// Disorder-7) — real, validated, widely-used clinical screening
// instruments (public domain), not synthetic questions. Response scale for
// both is the standard 0–3 frequency rating.
export const RESPONSE_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export const PHQ9_QUESTIONS: ScreenerQuestion[] = [
  { id: 'phq9_1', instrument: 'PHQ-9', order: 1, text: 'Little interest or pleasure in doing things' },
  { id: 'phq9_2', instrument: 'PHQ-9', order: 2, text: 'Feeling down, depressed, or hopeless' },
  { id: 'phq9_3', instrument: 'PHQ-9', order: 3, text: 'Trouble falling or staying asleep, or sleeping too much' },
  { id: 'phq9_4', instrument: 'PHQ-9', order: 4, text: 'Feeling tired or having little energy' },
  { id: 'phq9_5', instrument: 'PHQ-9', order: 5, text: 'Poor appetite or overeating' },
  {
    id: 'phq9_6',
    instrument: 'PHQ-9',
    order: 6,
    text: 'Feeling bad about yourself — or that you are a failure, or have let yourself or your family down',
  },
  {
    id: 'phq9_7',
    instrument: 'PHQ-9',
    order: 7,
    text: 'Trouble concentrating on things, such as reading or watching television',
  },
  {
    id: 'phq9_8',
    instrument: 'PHQ-9',
    order: 8,
    text: 'Moving or speaking so slowly that others could notice — or the opposite, being fidgety or restless',
  },
  {
    id: 'phq9_9',
    instrument: 'PHQ-9',
    order: 9,
    text: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
  },
];

export const GAD7_QUESTIONS: ScreenerQuestion[] = [
  { id: 'gad7_1', instrument: 'GAD-7', order: 1, text: 'Feeling nervous, anxious, or on edge' },
  { id: 'gad7_2', instrument: 'GAD-7', order: 2, text: 'Not being able to stop or control worrying' },
  { id: 'gad7_3', instrument: 'GAD-7', order: 3, text: 'Worrying too much about different things' },
  { id: 'gad7_4', instrument: 'GAD-7', order: 4, text: 'Trouble relaxing' },
  { id: 'gad7_5', instrument: 'GAD-7', order: 5, text: 'Being so restless that it is hard to sit still' },
  { id: 'gad7_6', instrument: 'GAD-7', order: 6, text: 'Becoming easily annoyed or irritable' },
  { id: 'gad7_7', instrument: 'GAD-7', order: 7, text: 'Feeling afraid, as if something awful might happen' },
];

export const SCREENER_QUESTIONS: ScreenerQuestion[] = [...PHQ9_QUESTIONS, ...GAD7_QUESTIONS];

// PHQ-9 item 9 is the instrument's own self-harm screening question — any
// non-zero answer is a standard clinical trigger for an immediate safety check.
export const PHQ9_SELF_HARM_ITEM_ID = 'phq9_9';

// PHQ-9 item 3 is the instrument's own sleep question — used as a real
// (if partial) signal for the report's Sleep Quality Index instead of a
// fabricated number, since the app collects no dedicated PSQI instrument.
export const PHQ9_SLEEP_ITEM_ID = 'phq9_3';

export function scorePHQ9(responses: Record<string, number>): ScreenerResult {
  const total = PHQ9_QUESTIONS.reduce((sum, q) => sum + (responses[q.id] ?? 0), 0);
  let severity = 'Minimal';
  if (total >= 20) severity = 'Severe';
  else if (total >= 15) severity = 'Moderately Severe';
  else if (total >= 10) severity = 'Moderate';
  else if (total >= 5) severity = 'Mild';
  return { instrument: 'PHQ-9', total, maxTotal: 27, severity };
}

export function scoreGAD7(responses: Record<string, number>): ScreenerResult {
  const total = GAD7_QUESTIONS.reduce((sum, q) => sum + (responses[q.id] ?? 0), 0);
  let severity = 'Minimal';
  if (total >= 15) severity = 'Severe';
  else if (total >= 10) severity = 'Moderate';
  else if (total >= 5) severity = 'Mild';
  return { instrument: 'GAD-7', total, maxTotal: 21, severity };
}

export function isScreenerComplete(responses: Record<string, number>): boolean {
  return SCREENER_QUESTIONS.every((q) => responses[q.id] !== undefined);
}
