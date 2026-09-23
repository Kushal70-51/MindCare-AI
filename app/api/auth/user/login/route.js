import { cookies } from 'next/headers';
import getDb from '../../../../../lib/db';
import {
  verifyPassword,
  createUserSession,
  sanitizeUser,
  USER_SESSION_COOKIE_NAME,
  USER_SESSION_MAX_AGE_SECONDS,
} from '../../../../../lib/userAuth';

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

  const cleanEmail = email.toLowerCase().trim();
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

  if (!user) {
    return Response.json({ error: 'No account found with that email.' }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return Response.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const { token } = createUserSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: USER_SESSION_MAX_AGE_SECONDS,
  });

  return Response.json({ success: true, user: sanitizeUser(user) });
}
