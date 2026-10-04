import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import getDb from '../../../../lib/db';
import { getUserFromToken, USER_SESSION_COOKIE_NAME } from '../../../../lib/userAuth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE_NAME)?.value;
  const user = getUserFromToken(token);

  if (!user) {
    return Response.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM user_reports WHERE user_id = ? ORDER BY created_at ASC')
    .all(user.id);

  const history = rows.map((row) => {
    let parsedReport = null;
    try {
      if (row.report_json) parsedReport = JSON.parse(row.report_json);
    } catch (e) {
      console.warn('Failed to parse report_json from DB:', e);
    }

    return {
      id: row.id,
      date: row.created_at,
      completionDate: parsedReport?.completionDate || new Date(row.created_at).toLocaleDateString(),
      overallScore: row.overall_score,
      riskLevel: row.risk_level,
      phq9Total: row.phq9_total ?? undefined,
      gad7Total: row.gad7_total ?? undefined,
      reportJson: parsedReport,
    };
  });

  return Response.json({ success: true, history });
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE_NAME)?.value;
  const user = getUserFromToken(token);

  if (!user) {
    return Response.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { overallScore, riskLevel, phq9Total, gad7Total, report, answers } = body || {};

  if (overallScore === undefined || !riskLevel || !report) {
    return Response.json({ error: 'Missing required report fields.' }, { status: 400 });
  }

  const reportId = `rep_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const createdAt = new Date().toISOString();
  const db = getDb();

  db.prepare(
    `INSERT INTO user_reports (
      id, user_id, overall_score, risk_level, phq9_total, gad7_total, report_json, answers_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    reportId,
    user.id,
    overallScore,
    riskLevel,
    phq9Total ?? null,
    gad7Total ?? null,
    JSON.stringify(report),
    answers ? JSON.stringify(answers) : null,
    createdAt
  );

  return Response.json({
    success: true,
    entry: {
      id: reportId,
      date: createdAt,
      completionDate: report.completionDate || new Date(createdAt).toLocaleDateString(),
      overallScore,
      riskLevel,
      phq9Total,
      gad7Total,
      reportJson: report,
    },
  });
}
