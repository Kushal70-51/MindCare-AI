import getDb from '../../../../../lib/db';

function checkPasscode(request) {
  const provided = request.headers.get('x-admin-passcode');
  return provided && process.env.ADMIN_PASSCODE && provided === process.env.ADMIN_PASSCODE;
}

export async function PATCH(request, { params }) {
  if (!checkPasscode(request)) {
    return Response.json({ error: 'Invalid admin passcode.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action, rejectionReason } = body || {};
  if (!['verify', 'reject'].includes(action)) {
    return Response.json({ error: "action must be 'verify' or 'reject'." }, { status: 400 });
  }

  const db = getDb();
  const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(params.id);
  if (!doctor) return Response.json({ error: 'Doctor not found.' }, { status: 404 });

  if (action === 'verify') {
    db.prepare(
      "UPDATE doctors SET verification_status = 'verified', verified_at = ?, rejection_reason = NULL WHERE id = ?"
    ).run(new Date().toISOString(), params.id);
  } else {
    db.prepare(
      "UPDATE doctors SET verification_status = 'rejected', rejection_reason = ? WHERE id = ?"
    ).run(rejectionReason || 'Credentials could not be verified.', params.id);
  }

  return Response.json({ success: true });
}
