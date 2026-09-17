import { cookies } from 'next/headers';
import getDb from '../../../../../lib/db';
import { verifyPassword, createSession, sanitizeDoctor, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '../../../../../lib/auth';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password } = body || {};
  if (!email || !password) {
    return Response.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const db = getDb();
  const doctor = db.prepare('SELECT * FROM doctors WHERE email = ?').get(email.toLowerCase());

  if (!doctor) {
    return Response.json({ error: 'No account found with that email.' }, { status: 401 });
  }

  const validPassword = await verifyPassword(password, doctor.password_hash);
  if (!validPassword) {
    return Response.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  if (doctor.verification_status === 'pending') {
    return Response.json(
      { error: 'Your account is still pending admin verification. Please check back soon.' },
      { status: 403 }
    );
  }
  if (doctor.verification_status === 'rejected') {
    return Response.json(
      {
        error: `Your verification was not approved${doctor.rejection_reason ? `: ${doctor.rejection_reason}` : '.'}`,
      },
      { status: 403 }
    );
  }

  const { token } = createSession(doctor.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return Response.json({ success: true, doctor: sanitizeDoctor(doctor) });
}
