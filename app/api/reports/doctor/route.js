import { cookies } from 'next/headers';
import getDb from '../../../../lib/db';
import { getDoctorFromToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const doctor = getDoctorFromToken(token);
  if (!doctor) {
    return Response.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, patient_name, patient_email, shared_at, reviewed, doctor_notes, report_json
       FROM shared_reports WHERE doctor_id = ? ORDER BY shared_at DESC`
    )
    .all(doctor.id);

  const reports = rows.map((r) => {
    const report = JSON.parse(r.report_json);
    return {
      id: r.id,
      patientName: r.patient_name,
      patientEmail: r.patient_email,
      sharedAt: r.shared_at,
      reviewed: !!r.reviewed,
      doctorNotes: r.doctor_notes,
      overallScore: report.overallScore,
      riskLevel: report.riskLevel,
      overallStatus: report.overallStatus,
    };
  });

  return Response.json({ reports });
}
