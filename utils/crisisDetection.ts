// Deterministic, keyword-based crisis-language detection. Intentionally NOT
// dependent on any ML model output — safety-critical detection needs to be
// reliable and inspectable, not probabilistic.
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(ing)? myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend(ing)? my life\b/i,
  /\bnot worth living\b/i,
  /\bbetter off dead\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bself[- ]?harm\b/i,
  /\bcan'?t go on\b/i,
  /\bwant(ed)? to die\b/i,
  /\bno reason to live\b/i,
  /\bno point (in )?living\b/i,
  /\bwish i (was|were) dead\b/i,
  // Hindi / Hinglish
  /आत्महत्या/i,
  /खुदकुशी/i,
  /मरना चाहता/i,
  /मरना चाहती/i,
  /मरने का मन/i,
  /जीने का मन नहीं/i,
  /\bmar(ne)? ka man\b/i,
  /\bkhud ko mar(na)?\b/i,
  /\bmar ja(na)? chah(ta|ti)\b/i,
  /\bjeene ki ichha nahi\b/i,
  /\baatmhatya\b/i,
  /\bkhudkushi\b/i,
  // Marathi / Marathinglish
  /जीव द्यावासा वाटतो/i,
  /मरावेसे वाटते/i,
  /जगण्‍यात काही अर्थ नाही/i,
  /\bjiv dyavasa vat(ato|te)\b/i,
  /\bmaravese vat(ate|te)\b/i,
  /\bjagnyat kahi artha nahi\b/i,
  /\baatmahatya\b/i,
];

export function detectCrisisLanguage(text: string): boolean {
  if (!text || !text.trim()) return false;
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}

export interface CrisisResource {
  name: string;
  contact: string;
  hours: string;
}

// A mix of India-based and international 24/7 lines — this is a screening
// aid, not an emergency service, so resources are surfaced, not called.
export const CRISIS_RESOURCES: CrisisResource[] = [
  { name: 'AASRA', contact: '+91 9820466726', hours: '24/7' },
  { name: 'Vandrevala Foundation Helpline', contact: '1860-2662-345 / 1800-2333-330', hours: '24/7' },
  { name: 'iCall (TISS)', contact: '9152987821', hours: 'Mon–Sat, 10am–8pm' },
  { name: '988 Suicide & Crisis Lifeline (US)', contact: 'Call or text 988', hours: '24/7' },
];
