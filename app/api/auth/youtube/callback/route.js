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

const CLEAR_YT_STATE_COOKIE = 'yt_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
const CLEAR_GOOGLE_STATE_COOKIE = 'google_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

function redirectWithCookies(location, cookies) {
  const headers = new Headers({ Location: location });
  cookies.forEach((cookie) => headers.append('Set-Cookie', cookie));
  return new Response(null, { status: 302, headers });
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  const cookies = parseCookies(request.headers.get('cookie'));
  const expectedYtState = cookies['yt_oauth_state'];
  const expectedGoogleState = cookies['google_oauth_state'];

  const isUserLogin = Boolean(expectedGoogleState && state === expectedGoogleState);

  if (errorParam) {
    const targetUrl = isUserLogin ? `${url.origin}/?auth=denied` : `${url.origin}/?youtube_auth=denied`;
    return redirectWithCookies(targetUrl, [CLEAR_YT_STATE_COOKIE, CLEAR_GOOGLE_STATE_COOKIE]);
  }

  // Validate state
  const stateValid =
    (expectedYtState && state === expectedYtState) ||
    (expectedGoogleState && state === expectedGoogleState) ||
    Boolean(state && (state === expectedYtState || state === expectedGoogleState));

  if (!code || !state || !stateValid) {
    const targetUrl = isUserLogin ? `${url.origin}/?auth=error` : `${url.origin}/?youtube_auth=error`;
    return redirectWithCookies(targetUrl, [CLEAR_YT_STATE_COOKIE, CLEAR_GOOGLE_STATE_COOKIE]);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    process.env.YOUTUBE_OAUTH_REDIRECT_URI ||
    'http://localhost:3000/api/auth/youtube/callback';

  try {
    // 1. Exchange authorization code for tokens
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
      console.error('Google/YouTube OAuth token exchange failed:', tokenData);
      const targetUrl = isUserLogin ? `${url.origin}/?auth=error` : `${url.origin}/?youtube_auth=error`;
      return redirectWithCookies(targetUrl, [CLEAR_YT_STATE_COOKIE, CLEAR_GOOGLE_STATE_COOKIE]);
    }

    const responseCookies = [CLEAR_YT_STATE_COOKIE, CLEAR_GOOGLE_STATE_COOKIE];

    // Store YouTube tokens for social insights if token has access
    responseCookies.push(
      `yt_access_token=${tokenData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${tokenData.expires_in || 3600}`
    );
    if (tokenData.refresh_token) {
      responseCookies.push(
        `yt_refresh_token=${tokenData.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
      );
    }

    // 2. Fetch Google User Profile if available to authenticate the patient user
    try {
      const profileRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();

      if (profile?.email) {
        const cleanEmail = profile.email.toLowerCase().trim();
        const fullName = profile.name || cleanEmail.split('@')[0];
        const avatarUrl = profile.picture || 'https://lh3.googleusercontent.com/a/default-user';
        const now = new Date().toISOString();

        const db = getDb();
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

        if (!user) {
          const userId = `usr_google_${crypto.randomBytes(8).toString('hex')}`;
          db.prepare(
            'INSERT INTO users (id, full_name, email, password_hash, auth_provider, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          ).run(userId, fullName, cleanEmail, 'OAUTH_GOOGLE', 'google', avatarUrl, now);
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        } else {
          db.prepare(
            'UPDATE users SET auth_provider = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?'
          ).run('google', avatarUrl, user.id);
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
        }

        const { token } = createUserSession(user.id);
        responseCookies.push(
          `${USER_SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${USER_SESSION_MAX_AGE_SECONDS}`
        );
      }
    } catch (profileErr) {
      console.warn('Could not retrieve Google UserInfo profile:', profileErr.message);
    }

    // Redirect to patient dashboard/consent if user login, or to connected platforms screen
    const destination = isUserLogin ? `${url.origin}/?auth=google_success` : `${url.origin}/?youtube_auth=success`;
    return redirectWithCookies(destination, responseCookies);
  } catch (err) {
    console.error('Google/YouTube OAuth callback error:', err);
    const targetUrl = isUserLogin ? `${url.origin}/?auth=error` : `${url.origin}/?youtube_auth=error`;
    return redirectWithCookies(targetUrl, [CLEAR_YT_STATE_COOKIE, CLEAR_GOOGLE_STATE_COOKIE]);
  }
}
