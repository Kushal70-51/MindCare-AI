// Shared helpers for reading/refreshing the httpOnly YouTube OAuth cookies
// set by app/api/auth/youtube/{login,callback}. Used by any route that needs
// a valid Google access token for the signed-in user.
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

// Returns a usable access token, transparently refreshing it via the stored
// refresh token if the short-lived access token cookie has expired.
export async function getValidAccessToken(request) {
  const cookies = parseCookies(request.headers.get('cookie'));
  if (cookies['yt_access_token']) {
    return { accessToken: cookies['yt_access_token'], refreshedCookie: null };
  }
  if (!cookies['yt_refresh_token']) return { accessToken: null, refreshedCookie: null };

  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;

  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: cookies['yt_refresh_token'],
        grant_type: 'refresh_token',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) return { accessToken: null, refreshedCookie: null };

    return {
      accessToken: data.access_token,
      refreshedCookie: `yt_access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${data.expires_in || 3600}`,
    };
  } catch (err) {
    console.error('YouTube token refresh failed:', err);
    return { accessToken: null, refreshedCookie: null };
  }
}
