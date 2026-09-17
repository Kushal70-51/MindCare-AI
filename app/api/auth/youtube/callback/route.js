// Exchanges the authorization code Google sends back for real access +
// refresh tokens, then stores them in httpOnly cookies. There's no separate
// patient-accounts table in this app (patient identity is client-side mock
// state), so the browser session itself is the account boundary here —
// which is fine for a read-only, revocable-anytime scope like this.
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

const CLEAR_STATE_COOKIE = 'yt_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

// Response.redirect() returns a Response with immutable/opaque headers in
// Next.js's route runtime — appending Set-Cookie to it throws ("TypeError:
// immutable"). Building the redirect from a real Headers instance (which
// supports multiple Set-Cookie values via append) keeps it mutable.
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
  const expectedState = cookies['yt_oauth_state'];

  if (errorParam) {
    return redirectWithCookies(`${url.origin}/?youtube_auth=denied`, [CLEAR_STATE_COOKIE]);
  }

  if (!code || !state || state !== expectedState) {
    return redirectWithCookies(`${url.origin}/?youtube_auth=error`, [CLEAR_STATE_COOKIE]);
  }

  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_OAUTH_REDIRECT_URI;

  try {
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
      console.error('YouTube OAuth token exchange failed:', tokenData);
      return redirectWithCookies(`${url.origin}/?youtube_auth=error`, [CLEAR_STATE_COOKIE]);
    }

    const cookies = [
      CLEAR_STATE_COOKIE,
      `yt_access_token=${tokenData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${tokenData.expires_in || 3600}`,
    ];
    if (tokenData.refresh_token) {
      cookies.push(
        `yt_refresh_token=${tokenData.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
      );
    }
    return redirectWithCookies(`${url.origin}/?youtube_auth=success`, cookies);
  } catch (err) {
    console.error('YouTube OAuth callback error:', err);
    return redirectWithCookies(`${url.origin}/?youtube_auth=error`, [CLEAR_STATE_COOKIE]);
  }
}
