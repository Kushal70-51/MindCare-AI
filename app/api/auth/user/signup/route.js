import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import getDb from '../../../../../lib/db';
import {
  hashPassword,
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

  const { fullName, email, password } = body || {};

  if (!fullName || !email || !password) {
    return Response.json({ error: 'Full name, email, and password are required.' }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return Response.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const passwordHash = await hashPassword(password);
  const createdAt = new Date().toISOString();

  db.prepare(
    'INSERT INTO users (id, full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, fullName.trim(), cleanEmail, passwordHash, createdAt);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const { token } = createUserSession(userId);

  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: USER_SESSION_MAX_AGE_SECONDS,
  });

  return Response.json({ success: true, user: sanitizeUser(user) });
}
