// Exchanges the authorization code Reddit sends back for real access +
// refresh tokens, then stores them in httpOnly cookies. Mirrors
// app/api/auth/youtube/callback/route.js.
const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

const CLEAR_STATE_COOKIE = 'reddit_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

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
  const expectedState = cookies['reddit_oauth_state'];

  if (errorParam) {
    return redirectWithCookies(`${url.origin}/?reddit_auth=denied`, [CLEAR_STATE_COOKIE]);
  }
  if (!code || !state || state !== expectedState) {
    return redirectWithCookies(`${url.origin}/?reddit_auth=error`, [CLEAR_STATE_COOKIE]);
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const redirectUri = process.env.REDDIT_REDIRECT_URI;

  try {
    const tokenRes = await fetch(REDDIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': process.env.REDDIT_USER_AGENT || 'web:mindcare-ai:v1.0',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Reddit OAuth token exchange failed:', tokenData);
      return redirectWithCookies(`${url.origin}/?reddit_auth=error`, [CLEAR_STATE_COOKIE]);
    }

    const cookies = [
      CLEAR_STATE_COOKIE,
      `reddit_access_token=${tokenData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${tokenData.expires_in || 3600}`,
    ];
    if (tokenData.refresh_token) {
      cookies.push(
        `reddit_refresh_token=${tokenData.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
      );
    }
    return redirectWithCookies(`${url.origin}/?reddit_auth=success`, cookies);
  } catch (err) {
    console.error('Reddit OAuth callback error:', err);
    return redirectWithCookies(`${url.origin}/?reddit_auth=error`, [CLEAR_STATE_COOKIE]);
  }
}
