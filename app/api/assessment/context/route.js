import fs from 'node:fs';
import path from 'node:path';

const CONTEXTS_DIR = path.join(process.cwd(), 'data', 'contexts');

function ensureDir() {
  if (!fs.existsSync(CONTEXTS_DIR)) {
    fs.mkdirSync(CONTEXTS_DIR, { recursive: true });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== 'object') {
      return Response.json({ error: 'Invalid context payload' }, { status: 400 });
    }

    ensureDir();

    const sessionId = payload.sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const timestamp = new Date().toISOString();

    const formattedContext = {
      sessionId,
      savedAt: timestamp,
      user: {
        fullName: payload.user?.fullName || 'Anonymous Patient',
        age: payload.user?.age || 'Unspecified',
        language: payload.user?.language || 'en-IN',
      },
      dialogue: payload.dialogue || [],
      facialAnalysis: payload.facialAnalysis || {
        dominantEmotion: 'neutral',
        averageConfidence: 0,
        emotionDistribution: {},
        totalFrames: 0,
      },
      acousticAnalysis: payload.acousticAnalysis || {
        dominantTone: 'NEUTRAL',
        positiveRatio: 0,
        negativeRatio: 0,
      },
      linguisticAnalysis: payload.linguisticAnalysis || {
        dominantEmotion: 'neutral',
        positiveRatio: 0,
        negativeRatio: 0,
      },
      screeners: payload.screeners || {
        phq9: null,
        gad7: null,
      },
      behavioralSummary: payload.behavioralSummary || {
        sleepAndCircadian: 'Not assessed',
        energyAndBurnout: 'Not assessed',
        stressAndAnxiety: 'Not assessed',
        socialConnectedness: 'Not assessed',
        copingMechanisms: 'Not assessed',
      },
      crisisSafety: payload.crisisSafety || {
        everFlagged: false,
        flaggedKeywords: [],
      },
      provisionalScores: payload.provisionalScores || {
        overallScore: 75,
        riskLevel: 'Low',
        conditions: [],
      },
    };

    const sessionFilePath = path.join(CONTEXTS_DIR, `assessment_${sessionId}.json`);
    const latestFilePath = path.join(CONTEXTS_DIR, 'latest_assessment_context.json');

    const jsonString = JSON.stringify(formattedContext, null, 2);
    fs.writeFileSync(sessionFilePath, jsonString, 'utf-8');
    fs.writeFileSync(latestFilePath, jsonString, 'utf-8');

    console.log(`[MindCare Context API] Stored clinical assessment context for session ${sessionId} (${jsonString.length} bytes)`);

    return Response.json({
      success: true,
      sessionId,
      savedAt: timestamp,
      filePath: sessionFilePath,
      context: formattedContext,
    });
  } catch (err) {
    console.error('[MindCare Context API] Error saving assessment context:', err);
    return Response.json({ error: 'Failed to save context file', message: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    ensureDir();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    const targetPath = sessionId
      ? path.join(CONTEXTS_DIR, `assessment_${sessionId}.json`)
      : path.join(CONTEXTS_DIR, 'latest_assessment_context.json');

    if (!fs.existsSync(targetPath)) {
      return Response.json({ error: 'Context file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(targetPath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    return Response.json({ success: true, context: parsed });
  } catch (err) {
    console.error('[MindCare Context API] Error reading assessment context:', err);
    return Response.json({ error: 'Failed to read context file', message: err.message }, { status: 500 });
  }
}
