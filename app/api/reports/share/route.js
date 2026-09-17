import crypto from 'node:crypto';
import getDb from '../../../../lib/db';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { doctorId, patientName, patientEmail, report } = body || {};
  if (!doctorId || !patientName || !patientEmail || !report) {
    return Response.json(
      { error: 'doctorId, patientName, patientEmail, and report are required.' },
      { status: 400 }
    );
  }

  const db = getDb();
  const doctor = db
    .prepare("SELECT id FROM doctors WHERE id = ? AND verification_status = 'verified'")
    .get(doctorId);
  if (!doctor) {
    return Response.json({ error: 'Doctor not found or not verified.' }, { status: 404 });
  }

  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO shared_reports (id, doctor_id, patient_name, patient_email, report_json, shared_at, reviewed)
     VALUES (?, ?, ?, ?, ?, ?, 0)`
  ).run(id, doctorId, patientName, patientEmail, JSON.stringify(report), new Date().toISOString());

  return Response.json({ success: true, id });
}
