export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
}

export interface PrivacyConsentState {
  privacyPolicy: boolean;
  aiAssessment: boolean;
  nonMedicalDisclaimer: boolean;
  socialMediaData: boolean;
}

export interface SocialPlatform {
  id: string;
  platform: 'Instagram' | 'Reddit' | 'Twitter (X)' | 'Facebook' | 'YouTube' | 'LinkedIn';
  handle: string;
  connected: boolean;
  iconName: string;
  description: string;
  color: string;
}

// One turn of history exchanged with the adaptive interview API
// (app/api/interview) — mirrors the Anthropic messages shape.
export interface InterviewMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssessmentAnswer {
  questionId: number;
  questionText: string;
  userResponseText: string;
  sentiment: 'Positive' | 'Calm' | 'Neutral' | 'Mild Distress' | 'High Distress';
  confidence: number;
  speechDurationSec: number;
  facialEmotion?: string;
  linguisticEmotion?: string;
  linguisticConfidence?: number;
  acousticEmotion?: string;
  acousticConfidence?: number;
}

export interface FacialEmotionSample {
  timestamp: number;
  dominantEmotion: string;
  confidence: number;
  expressions: Record<string, number>;
  questionId?: number;
}

export interface VoiceEmotionSample {
  timestamp: number;
  dominantEmotion: string;
  confidence: number;
  expressions: Record<string, number>;
  questionId?: number;
}

// Standardized clinical screeners (PHQ-9 / GAD-7) — real validated
// instruments, scored with their official cutoffs, not simulated data.
export interface ScreenerQuestion {
  id: string;
  instrument: 'PHQ-9' | 'GAD-7';
  order: number;
  text: string;
}

export interface ScreenerResult {
  instrument: 'PHQ-9' | 'GAD-7';
  total: number;
  maxTotal: number;
  severity: string;
}

export interface ReportHistoryEntry {
  date: string;
  completionDate: string;
  overallScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  phq9Total?: number;
  gad7Total?: number;
}

export interface ConditionScore {
  name: string;
  score: number; // 0 - 100
  severity: 'Optimal' | 'Mild' | 'Moderate' | 'Severe';
  description: string;
  changeTrend: 'Stable' | 'Improving' | 'Requires Attention';
}

export interface ShapFeatureImpact {
  feature: string;
  category: 'Speech Acoustics' | 'Facial Dynamics' | 'Linguistic Sentiment' | 'Social Context' | 'Sleep & Behavioral Pattern';
  impactValue: number; // positive = pushes toward distress, negative = protective factor
  formattedValue: string;
  explanation: string;
}

export interface RetrievedEvidenceItem {
  id: string;
  source: 'Live Audio Transcript' | 'Facial Micro-expression' | 'Social Data Feed' | 'Self-Report Response';
  quote: string;
  sentiment: string;
  timestamp: string;
}

export interface ClinicalRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'Lifestyle & Sleep' | 'Mindfulness & Breathing' | 'Therapeutic Pathway' | 'Clinical Follow-up';
  priority: 'High' | 'Medium' | 'Routine';
}

export interface MedicalReference {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
}

export interface MentalHealthReport {
  overallScore: number; // 0 - 100 well-being index
  overallStatus: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  confidenceScore: number;
  completionDate: string;
  conditions: ConditionScore[];
  shapFeatures: ShapFeatureImpact[];
  retrievedEvidence: RetrievedEvidenceItem[];
  recommendations: ClinicalRecommendation[];
  medicalReferences: MedicalReference[];
  behavioralSummary?: Record<string, string>;
}

export type ScreenId =
  | 'splash'
  | 'welcome'
  | 'register'
  | 'login'
  | 'consent'
  | 'social'
  | 'dashboard'
  | 'screener'
  | 'assessment'
  | 'completed'
  | 'report';
