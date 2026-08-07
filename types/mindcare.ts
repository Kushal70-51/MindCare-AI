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

export interface AssessmentQuestion {
  id: number;
  category: string;
  questionText: string;
  aiVoicePrompt: string;
  sampleAnswerHint: string;
  domain: 'Mood & Emotion' | 'Cognitive & Sleep' | 'Stress & Coping' | 'Social Engagement' | 'Overall Well-being';
}

export interface AssessmentAnswer {
  questionId: number;
  questionText: string;
  userResponseText: string;
  sentiment: 'Positive' | 'Calm' | 'Neutral' | 'Mild Distress' | 'High Distress';
  confidence: number;
  speechDurationSec: number;
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
}

export type ScreenId =
  | 'splash'
  | 'welcome'
  | 'register'
  | 'login'
  | 'consent'
  | 'social'
  | 'dashboard'
  | 'assessment'
  | 'completed'
  | 'report';
