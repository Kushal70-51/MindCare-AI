// Shared helpers for reading/refreshing the httpOnly Reddit OAuth cookies
// set by app/api/auth/reddit/{login,callback}. Mirrors lib/youtubeAuth.js.
const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';

export function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function basicAuthHeader() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
}

export async function getValidAccessToken(request) {
  const cookies = parseCookies(request.headers.get('cookie'));
  if (cookies['reddit_access_token']) {
    return { accessToken: cookies['reddit_access_token'], refreshedCookie: null };
  }
  if (!cookies['reddit_refresh_token']) return { accessToken: null, refreshedCookie: null };

  try {
    const res = await fetch(REDDIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': process.env.REDDIT_USER_AGENT || 'web:mindcare-ai:v1.0',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: cookies['reddit_refresh_token'],
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) return { accessToken: null, refreshedCookie: null };

    return {
      accessToken: data.access_token,
      refreshedCookie: `reddit_access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${data.expires_in || 3600}`,
    };
  } catch (err) {
    console.error('Reddit token refresh failed:', err);
    return { accessToken: null, refreshedCookie: null };
  }
}
