import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import getDb from '../../../lib/db';
import { getDoctorFromToken, SESSION_COOKIE_NAME } from '../../../lib/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sharedReportId = searchParams.get('sharedReportId');
  if (!sharedReportId) {
    return Response.json({ error: 'sharedReportId is required.' }, { status: 400 });
  }

  const db = getDb();
  const report = db.prepare('SELECT id, doctor_id FROM shared_reports WHERE id = ?').get(sharedReportId);
  if (!report) return Response.json({ error: 'Report not found.' }, { status: 404 });

  // If a doctor session is present, it must own this report thread. Patients
  // have no server-side account in this prototype, so their side relies on
  // possession of the (unguessable) shared_report id — the same trust model
  // already used by the report-detail link itself.
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const doctor = getDoctorFromToken(token);
  if (doctor && doctor.id !== report.doctor_id) {
    return Response.json({ error: 'Not authorized for this conversation.' }, { status: 403 });
  }

  const messages = db
    .prepare('SELECT id, sender_type, sender_name, message_text, created_at FROM messages WHERE shared_report_id = ? ORDER BY created_at ASC')
    .all(sharedReportId);

  return Response.json({ messages });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sharedReportId, messageText, patientName } = body || {};
  if (!sharedReportId || !messageText || !messageText.trim()) {
    return Response.json({ error: 'sharedReportId and messageText are required.' }, { status: 400 });
  }

  const db = getDb();
  const report = db.prepare('SELECT id, doctor_id, patient_name FROM shared_reports WHERE id = ?').get(sharedReportId);
  if (!report) return Response.json({ error: 'Report not found.' }, { status: 404 });

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const doctor = getDoctorFromToken(token);

  let senderType;
  let senderName;
  if (doctor) {
    if (doctor.id !== report.doctor_id) {
      return Response.json({ error: 'Not authorized for this conversation.' }, { status: 403 });
    }
    senderType = 'doctor';
    senderName = doctor.full_name;
  } else {
    senderType = 'patient';
    senderName = patientName || report.patient_name;
  }

  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO messages (id, shared_report_id, sender_type, sender_name, message_text, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, sharedReportId, senderType, senderName, messageText.trim(), new Date().toISOString());

  return Response.json({ success: true, id });
}
