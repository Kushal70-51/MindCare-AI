import { cookies } from 'next/headers';
import getDb from '../../../../../lib/db';
import { getDoctorFromToken, SESSION_COOKIE_NAME } from '../../../../../lib/auth';

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getDoctorFromToken(token);
}

export async function GET(request, { params }) {
  const doctor = await authenticate();
  if (!doctor) return Response.json({ error: 'Not authenticated.' }, { status: 401 });

  const db = getDb();
  const row = db
    .prepare('SELECT * FROM shared_reports WHERE id = ? AND doctor_id = ?')
    .get(params.id, doctor.id);
  if (!row) return Response.json({ error: 'Report not found.' }, { status: 404 });

  return Response.json({
    id: row.id,
    patientName: row.patient_name,
    patientEmail: row.patient_email,
    sharedAt: row.shared_at,
    reviewed: !!row.reviewed,
    doctorNotes: row.doctor_notes,
    report: JSON.parse(row.report_json),
  });
}

export async function PATCH(request, { params }) {
  const doctor = await authenticate();
  if (!doctor) return Response.json({ error: 'Not authenticated.' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const db = getDb();
  const row = db
    .prepare('SELECT id FROM shared_reports WHERE id = ? AND doctor_id = ?')
    .get(params.id, doctor.id);
  if (!row) return Response.json({ error: 'Report not found.' }, { status: 404 });

  const { reviewed, doctorNotes } = body || {};
  db.prepare(
    'UPDATE shared_reports SET reviewed = ?, doctor_notes = ? WHERE id = ?'
  ).run(reviewed ? 1 : 0, doctorNotes ?? null, params.id);

  return Response.json({ success: true });
}
