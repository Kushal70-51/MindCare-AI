import getDb from '../../../../lib/db';

function checkPasscode(request) {
  const provided = request.headers.get('x-admin-passcode');
  return provided && process.env.ADMIN_PASSCODE && provided === process.env.ADMIN_PASSCODE;
}

export async function GET(request) {
  if (!checkPasscode(request)) {
    return Response.json({ error: 'Invalid admin passcode.' }, { status: 401 });
  }

  const db = getDb();
  const doctors = db
    .prepare(
      `SELECT id, full_name, email, license_number, specialty, hospital_affiliation,
              years_experience, certificate_filename, certificate_data, verification_status,
              rejection_reason, created_at, verified_at
       FROM doctors ORDER BY created_at DESC`
    )
    .all();

  return Response.json({ doctors });
}
