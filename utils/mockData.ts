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

// Minimum duration for the clinical interview: 5 minutes (300 seconds)
export const MINIMUM_INTERVIEW_DURATION_SEC = 300;
// Baseline estimated question turns (adaptive conversation can take any number of turns)
export const TARGET_INTERVIEW_QUESTIONS = 10;

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

export const FALLBACK_QUESTION_SETS: Record<string, { questions: string[]; closing: string }> = {
  en: {
    questions: [
      "How have you been sleeping lately — do you wake up feeling rested, or more exhausted than usual?",
      "On a typical day, how would you describe your overall energy and motivation levels?",
      "What has been the biggest source of stress or mental pressure in your life recently?",
      "When anxiety or overwhelming thoughts arise, how easily are you able to calm your mind?",
      "Have you noticed a loss of interest or joy in things and hobbies you normally enjoy doing?",
      "How connected do you feel with friends, family, or people in your life right now?",
      "When things get tough emotionally, what coping mechanisms or habits do you usually rely on?",
      "How would you describe your inner self-talk — is it generally supportive, or quite harsh and self-critical?",
      "Do you ever experience physical symptoms when stressed, such as headaches, racing heart, or muscle tightness?",
      "How has your appetite or relationship with food and nutrition felt over the past few weeks?",
      "Are there particular times of day or specific triggers when you feel your mood dips the most?",
      "Looking ahead at the near future, do you feel a sense of hope and optimism, or uncertainty and dread?",
    ],
    closing: "Thank you so much for opening up and sharing so authentically with me. That provides valuable insight for your report. Let's look at your clinical summary now.",
  },
  hi: {
    questions: [
      "हाल ही में आपकी नींद कैसी रही है — क्या सुबह उठकर तरोताजा महसूस होता है, या थकान बनी रहती है?",
      "आमतौर पर दिनभर में आपकी ऊर्जा और काम करने की प्रेरणा का स्तर कैसा रहता है?",
      "हाल के दिनों में आपके जीवन में तनाव या मानसिक दबाव का सबसे बड़ा कारण क्या रहा है?",
      "जब चिंता या परेशान करने वाले विचार आते हैं, तो अपने मन को शांत करना कितना आसान या मुश्किल लगता है?",
      "क्या आपने उन कामों या शौक में दिलचस्पी कम होते देखी है जो आपको पहले पसंद थे?",
      "आजकल आप अपने दोस्तों, परिवार या करीबी लोगों के साथ कितना जुड़ाव या अकेलापन महसूस करते हैं?",
      "जब भावनात्मक रूप से मुश्किल समय आता है, तो खुद को संभालने के लिए आप किन आदतों या तरीकों का सहारा लेते हैं?",
      "आप अपने खुद के बारे में कैसा सोचते हैं — क्या आप खुद के प्रति दयालु हैं या अक्सर खुद की आलोचना करते हैं?",
      "तनाव के समय क्या आपको सिरदर्द, सीने में भारीपन या मांसपेशियों में खिंचाव जैसे शारीरिक लक्षण महसूस होते हैं?",
      "पिछले कुछ हफ्तों में आपकी भूख और खान-पान की दिनचर्या में कोई बदलाव आया है क्या?",
      "क्या दिन का कोई खास समय होता है जब आपका मूड सबसे ज्यादा उदास या परेशान रहता है?",
      "आने वाले समय को देखते हुए, क्या आपको उम्मीद और सकारात्मकता महसूस होती है, या अनिश्चितता और घबराहट?",
    ],
    closing: "अपने मन की बात इतनी ईमानदारी से साझा करने के लिए बहुत-बहुत धन्यवाद। इससे हमें आपके मानसिक स्वास्थ्य को समझने में बहुत मदद मिली है। अब हम आपकी रिपोर्ट की ओर बढ़ते हैं।",
  },
  mr: {
    questions: [
      "अलीकडच्या काळात तुमची झोप कशी आहे — सकाळी उठल्यावर ताजेतवाने वाटते की दिवसभर थकवा जाणवतो?",
      "साधारणपणे दिवसभरात तुमची ऊर्जा आणि काम करण्याचा उत्साह कसा असतो?",
      "गेल्या काही दिवसांत तुमच्या आयुष्यात तणाव किंवा मानसिक त्रासाचे मुख्य कारण काय राहिले आहे?",
      "जेव्हा अस्वस्थता किंवा नकारात्मक विचार मनात येतात, तेव्हा मन शांत करणे तुम्हाला किती सोपे किंवा कठीण जाते?",
      "पूर्वी आवडणाऱ्या गोष्टी किंवा छंदांमध्ये सध्या तुमचा रस किंवा आनंद कमी झाल्यासारखा वाटतो का?",
      "सध्या तुम्ही कुटुंब, मित्र किंवा जवळच्या व्यक्तींशी किती जोडलेले आहात की एकटेपणा जाणवतो?",
      "जेव्हा भावनिकदृष्ट्या कठीण वेळ येते, तेव्हा स्वतःला सावरण्यासाठी तुम्ही कोणत्या पद्धतींचा वापर करता?",
      "स्वतःबद्दल तुमचे विचार कसे असतात — तुम्ही स्वतःला आधार देता की जास्त दोष देता?",
      "तणावाच्या वेळी डोकेदुखी, छातीत धडधडणे किंवा स्नायूंमध्ये ताण अशी शारीरिक लक्षणे जाणवतात का?",
      "गेल्या काही आठवड्यांत तुमची भूक आणि खाण्यापिण्याच्या सवयींमध्ये काही बदल जाणवला आहे का?",
      "दिवसातील अशी कोणती वेळ आहे का जेव्हा मन जास्त उदास किंवा अस्वस्थ होते?",
      "भविष्याकडे पाहताना तुम्हाला आशा आणि सकारात्मकता वाटते की भीती आणि अनिश्चितता?",
    ],
    closing: "तुमच्या भावना इतक्या मोकळेपणाने मांडल्याबद्दल मनापासून धन्यवाद. तुमच्या मानसिक स्थितीचे अचूक विश्लेषण करण्यास यामुळे मोठी मदत झाली आहे. आता आपण तुमच्या सविस्तर अहवालाकडे वळूया.",
  },
};

export function getOfflineFallbackTurn(
  history: Array<{ role: string; content: string }>,
  lang?: string,
  elapsedSeconds: number = 0
): { reply: string; continue_interview: boolean } {
  const l = String(lang || 'en').toLowerCase();
  const key = l.startsWith('hi') ? 'hi' : l.startsWith('mr') ? 'mr' : 'en';
  const pack = FALLBACK_QUESTION_SETS[key] || FALLBACK_QUESTION_SETS.en;
  const assistantTurns = (history || []).filter((m) => m.role === 'assistant').length;

  // Only close if 5 minutes (300 seconds) have elapsed AND at least 10 turns completed
  if (elapsedSeconds >= MINIMUM_INTERVIEW_DURATION_SEC && assistantTurns >= 10) {
    return { reply: pack.closing, continue_interview: false };
  }
  const qIndex = Math.max(0, assistantTurns - 1) % pack.questions.length;
  return { reply: pack.questions[qIndex], continue_interview: true };
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
