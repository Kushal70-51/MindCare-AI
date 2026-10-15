import crypto from 'node:crypto';
import getDb from '../../../../../lib/db';
import {
  createUserSession,
  USER_SESSION_COOKIE_NAME,
  USER_SESSION_MAX_AGE_SECONDS,
} from '../../../../../lib/userAuth';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

const CLEAR_STATE_COOKIE = 'google_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

function redirectWithCookies(location, cookies) {
  const headers = new Headers({ Location: location });
  cookies.forEach((cookie) => headers.append('Set-Cookie', cookie));
  return new Response(null, { status: 302, headers });
}

function getAppOrigin(request, url) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (forwardedHost && !forwardedHost.includes('0.0.0.0') && !forwardedHost.includes('127.0.0.1')) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return 'https://mindcare-ai.duckdns.org';
}

export async function GET(request) {
  const url = new URL(request.url);
  const origin = getAppOrigin(request, url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  const cookies = parseCookies(request.headers.get('cookie'));
  const expectedState = cookies['google_oauth_state'];

  if (errorParam) {
    return redirectWithCookies(`${origin}/?auth=denied`, [CLEAR_STATE_COOKIE]);
  }

  if (!code || !state || state !== expectedState) {
    return redirectWithCookies(`${origin}/?auth=error`, [CLEAR_STATE_COOKIE]);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI || `${origin}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google OAuth token exchange failed:', tokenData);
      return redirectWithCookies(`${origin}/?auth=token_error`, [CLEAR_STATE_COOKIE]);
    }

    // 2. Fetch authenticated user profile from Google UserInfo
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.email) {
      console.error('Failed to retrieve Google profile:', profile);
      return redirectWithCookies(`${origin}/?auth=profile_error`, [CLEAR_STATE_COOKIE]);
    }

    const cleanEmail = profile.email.toLowerCase().trim();
    const fullName = profile.name || cleanEmail.split('@')[0];
    const avatarUrl = profile.picture || 'https://lh3.googleusercontent.com/a/default-user';
    const now = new Date().toISOString();

    // 3. Upsert into database
    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user) {
      const userId = `usr_google_${crypto.randomBytes(8).toString('hex')}`;
      db.prepare(
        'INSERT INTO users (id, full_name, email, password_hash, auth_provider, avatar_url, last_login_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(userId, fullName, cleanEmail, 'OAUTH_GOOGLE', 'google', avatarUrl, now, now);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else {
      db.prepare(
        'UPDATE users SET auth_provider = ?, avatar_url = COALESCE(?, avatar_url), last_login_at = ? WHERE id = ?'
      ).run('google', avatarUrl, now, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    // 4. Create active session token
    const { token } = createUserSession(user.id);

    const sessionCookie = `${USER_SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${USER_SESSION_MAX_AGE_SECONDS}`;

    return redirectWithCookies(`${origin}/?auth=google_success`, [
      CLEAR_STATE_COOKIE,
      sessionCookie,
    ]);
  } catch (err) {
    console.error('Google OAuth callback handler error:', err);
    return redirectWithCookies(`${origin}/?auth=server_error`, [CLEAR_STATE_COOKIE]);
  }
}
