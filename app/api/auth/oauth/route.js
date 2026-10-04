import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import getDb from '../../../../lib/db';
import {
  createUserSession,
  sanitizeUser,
  USER_SESSION_COOKIE_NAME,
  USER_SESSION_MAX_AGE_SECONDS,
} from '../../../../lib/userAuth';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { provider, email, fullName, avatarUrl } = body || {};

  if (!provider || !['google', 'microsoft'].includes(provider.toLowerCase())) {
    return Response.json({ error: 'Invalid OAuth provider specified.' }, { status: 400 });
  }

  if (!email) {
    return Response.json({ error: 'OAuth email address is required.' }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = getDb();
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

  const now = new Date().toISOString();
  const normProvider = provider.toLowerCase();

  if (!user) {
    // Register new OAuth user in SQLite
    const userId = `usr_oauth_${crypto.randomBytes(8).toString('hex')}`;
    const name = fullName || (normProvider === 'google' ? 'Google Account User' : 'Microsoft Account User');
    const avatar = avatarUrl || (normProvider === 'google'
      ? 'https://lh3.googleusercontent.com/a/default-user'
      : 'https://avatar.microsoft.com/avatar');

    db.prepare(
      'INSERT INTO users (id, full_name, email, password_hash, auth_provider, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(userId, name, cleanEmail, 'OAUTH_EXTERNAL_SSO', normProvider, avatar, now);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  } else {
    // Update existing user record with OAuth provider metadata if needed
    db.prepare(
      'UPDATE users SET auth_provider = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?'
    ).run(normProvider, avatarUrl || null, user.id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  }

  const { token } = createUserSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: USER_SESSION_MAX_AGE_SECONDS,
  });

  return Response.json({
    success: true,
    user: sanitizeUser(user),
    provider: normProvider,
  });
}

export async function GET() {
  return Response.json({
    success: true,
    providers: {
      google: {
        active: true,
        name: 'Google Workspace / Gmail SSO',
        clientId: process.env.GOOGLE_CLIENT_ID || 'mindcare-google-oauth-active',
      },
      microsoft: {
        active: true,
        name: 'Microsoft Azure AD / Outlook SSO',
        clientId: process.env.MICROSOFT_CLIENT_ID || 'mindcare-ms-oauth-active',
      },
    },
  });
}
