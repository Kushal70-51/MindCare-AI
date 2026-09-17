import {
  MentalHealthReport,
  SocialPlatform,
  UserProfile,
} from '../types/mindcare';

export const INITIAL_USER: UserProfile = {
  id: 'usr_10928',
  fullName: 'Alex Vance',
  email: 'alex.vance@mindcare.ai',
  phone: '+1 (555) 234-5678',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isLoggedIn: true,
};

export const DEFAULT_SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'instagram',
    platform: 'Instagram',
    handle: '@alex_vance',
    connected: false,
    iconName: 'Instagram',
    description: 'Visual expression & activity patterns',
    color: '#E4405F',
  },
  {
    id: 'reddit',
    platform: 'Reddit',
    handle: 'u/alex_mindful',
    connected: true,
    iconName: 'MessageSquare',
    description: 'Community interactions & text sentiment',
    color: '#FF4500',
  },
  {
    id: 'twitter',
    platform: 'Twitter (X)',
    handle: '@alex_vance_ai',
    connected: false,
    iconName: 'Twitter',
    description: 'Public thoughts & linguistic markers',
    color: '#1DA1F2',
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    handle: 'Alex Vance',
    connected: false,
    iconName: 'Facebook',
    description: 'Social connections & life updates',
    color: '#1877F2',
  },
  {
    id: 'youtube',
    platform: 'YouTube',
    handle: '',
    connected: false,
    iconName: 'Youtube',
    description: 'Real public comment sentiment analysis',
    color: '#FF0000',
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    handle: 'in/alexvance-health',
    connected: true,
    iconName: 'Linkedin',
    description: 'Professional stress & career sentiment',
    color: '#0A66C2',
  },
];

// Target question count for the adaptive AI interview (shown as progress
// estimate in the UI) — the model has discretion to land on 5 or 6.
export const TARGET_INTERVIEW_QUESTIONS = 6;

// Hardcoded first turn of the adaptive interview — asked instantly with no
// API latency, and guarantees age is always established before the
// AI-generated, age-aware follow-up questions begin (see app/api/interview).
export function buildInterviewOpener(name?: string, lang?: string): string {
  const firstName = name?.trim().split(' ')[0];
  const l = String(lang || '').toLowerCase();
  if (l.startsWith('hi') || l.includes('hindi')) {
    return firstName
      ? `नमस्ते ${firstName}, यहाँ आने के लिए शुक्रिया। बातचीत शुरू करने से पहले, क्या आप मुझे अपनी उम्र बता सकते हैं?`
      : `नमस्ते, यहाँ आने के लिए शुक्रिया। बातचीत शुरू करने से पहले, क्या आप मुझे अपनी उम्र बता सकते हैं?`;
  }
  if (l.startsWith('mr') || l.includes('marathi')) {
    return firstName
      ? `नमस्कार ${firstName}, इथे आल्याबद्दल धन्यवाद. संवाद सुरू करण्यापूर्वी, आपण आपले वय सांगू शकाल का?`
      : `नमस्कार, इथे आल्याबद्दल धन्यवाद. संवाद सुरू करण्यापूर्वी, आपण आपले वय सांगू शकाल का?`;
  }
  return firstName
    ? `Hi ${firstName}, thanks for being here. Before we get started, could you tell me your age?`
    : `Hi there, thanks for being here. Before we get started, could you tell me your age?`;
}

export const INITIAL_REPORT: MentalHealthReport = {
  overallScore: 78,
  overallStatus: 'Mild Stress & Sleep Irregularity',
  riskLevel: 'Low',
  confidenceScore: 94.2,
  completionDate: new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  conditions: [
    {
      name: 'Generalized Anxiety Marker',
      score: 34,
      severity: 'Mild',
      description: 'Slight elevation in acoustic pitch variance & subtle muscle tension indicators during stress prompts.',
      changeTrend: 'Stable',
    },
    {
      name: 'Depressive Affect Index',
      score: 18,
      severity: 'Optimal',
      description: 'Linguistic sentiment remains constructive with strong emotional range and healthy affect.',
      changeTrend: 'Improving',
    },
    {
      name: 'Sleep Quality Index (PSQI)',
      score: 58,
      severity: 'Moderate',
      description: 'Reported sleep delay & elevated late-night cognitive rumination markers.',
      changeTrend: 'Requires Attention',
    },
    {
      name: 'Resilience & Coping Capacity',
      score: 84,
      severity: 'Optimal',
      description: 'High engagement with adaptive self-soothing behaviors (mindful walking, structured breaks).',
      changeTrend: 'Improving',
    },
  ],
  shapFeatures: [
    {
      feature: 'Speech Pause Frequency (Pauses > 1.2s)',
      category: 'Speech Acoustics',
      impactValue: +0.28,
      formattedValue: '1.45 pauses/min',
      explanation: 'Slightly higher pause duration during stress reflection indicates mild cognitive processing load.',
    },
    {
      feature: 'Positive Emotional Vocabulary Ratio',
      category: 'Linguistic Sentiment',
      impactValue: -0.42,
      formattedValue: '28.4% positive terms',
      explanation: 'High usage of proactive, hopeful language acts as a strong protective factor against depressive mood.',
    },
    {
      feature: 'Facial Blink Rate & Micro-Frowns',
      category: 'Facial Dynamics',
      impactValue: +0.15,
      formattedValue: '22 blinks/min',
      explanation: 'Moderate blink frequency during sleep prompts highlights latent fatigue.',
    },
    {
      feature: 'Reddit Nighttime Activity Density',
      category: 'Social Context',
      impactValue: +0.32,
      formattedValue: 'Active 1:00 AM - 3:00 AM',
      explanation: 'Late-night social posting correlates with circadian rhythm disruption.',
    },
    {
      feature: 'Self-Reported Active Coping Score',
      category: 'Sleep & Behavioral Pattern',
      impactValue: -0.38,
      formattedValue: '4.2 / 5.0 Rating',
      explanation: 'Strong conscious awareness of coping mechanisms significantly mitigates overall risk level.',
    },
  ],
  retrievedEvidence: [
    {
      id: 'ev_1',
      source: 'Live Audio Transcript',
      quote: '"I tend to overthink before sleeping and check my phone late..."',
      sentiment: 'Mild Distress',
      timestamp: 'Question 3 • Sleep Architecture',
    },
    {
      id: 'ev_2',
      source: 'Facial Micro-expression',
      quote: 'Transient brow furrow detected during discussion of work deadlines (Confidence: 89%).',
      sentiment: 'Neutral',
      timestamp: 'Question 2 • Stress Dynamics',
    },
    {
      id: 'ev_3',
      source: 'Social Data Feed',
      quote: 'Reddit forum activity logged in r/mindfulness & r/sleep (Positive intent score: 0.81).',
      sentiment: 'Calm',
      timestamp: 'Reddit Integration',
    },
    {
      id: 'ev_4',
      source: 'Live Audio Transcript',
      quote: '"I go for evening walks and practice deep breathing, which helps..."',
      sentiment: 'Positive',
      timestamp: 'Question 5 • Coping Strategies',
    },
  ],
  recommendations: [
    {
      id: 'rec_1',
      title: 'Implement Digital Sunset (30-Min Pre-Sleep)',
      description: 'Cease screen interaction 30 minutes prior to bedtime to lower late-night cortisol and improve PSQI score.',
      category: 'Lifestyle & Sleep',
      priority: 'High',
    },
    {
      id: 'rec_2',
      title: '4-7-8 Diaphragmatic Breathing Protocol',
      description: 'Practice 4 cycles of 4-7-8 breathing when encountering sudden work deadline pressure.',
      category: 'Mindfulness & Breathing',
      priority: 'High',
    },
    {
      id: 'rec_3',
      title: 'Bi-Weekly Assessment Check-In',
      description: 'Schedule a follow-up AI mental health evaluation in 14 days to monitor sleep architecture trends.',
      category: 'Therapeutic Pathway',
      priority: 'Medium',
    },
    {
      id: 'rec_4',
      title: 'Share PDF Summary with Licensed Counselor',
      description: 'Export your SHAP explainability report to review sleep parameters during your next clinical appointment.',
      category: 'Clinical Follow-up',
      priority: 'Routine',
    },
  ],
  medicalReferences: [
    {
      id: 'ref_1',
      title: 'Acoustic Markers of Anxiety and Depression in Conversational Speech: A Systematic Review',
      authors: 'Kroenke, K., Spitzer, R. L., & Williams, J. B.',
      journal: 'Journal of Psychiatric Research & Behavioral Telemedicine',
      year: 2024,
      doi: '10.1016/j.jpsychires.2024.02.019',
    },
    {
      id: 'ref_2',
      title: 'Explainable AI (SHAP) in Clinical Mental Health Decision Support Systems',
      authors: 'Lundberg, S. M., & Lee, S. I.',
      journal: 'Nature Machine Intelligence & AI Healthcare',
      year: 2023,
      doi: '10.1038/s42256-023-00612-z',
    },
    {
      id: 'ref_3',
      title: 'Validation of Automated Multimodal Assessment (Speech, Facial Affect, and Social Markers)',
      authors: 'Beck, A. T., Steer, R. A., & Brown, G. K.',
      journal: 'IEEE Transactions on Affective Computing',
      year: 2025,
      doi: '10.1109/TAFFC.2025.3341908',
    },
  ],
};
