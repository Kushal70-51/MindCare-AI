const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

const CLEAR_STATE_COOKIE = 'li_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

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
  const expectedState = cookies['li_oauth_state'];

  if (errorParam) {
    return redirectWithCookies(`${url.origin}/?linkedin_auth=denied`, [CLEAR_STATE_COOKIE]);
  }

  if (!code || !state || state !== expectedState) {
    return redirectWithCookies(`${url.origin}/?linkedin_auth=error`, [CLEAR_STATE_COOKIE]);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';

  try {
    const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('LinkedIn token error:', tokenData);
      return redirectWithCookies(`${url.origin}/?linkedin_auth=error`, [CLEAR_STATE_COOKIE]);
    }

    const setCookie = `li_access_token=${tokenData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${tokenData.expires_in || 5184000}`;
    return redirectWithCookies(`${url.origin}/?linkedin_auth=success`, [CLEAR_STATE_COOKIE, setCookie]);
  } catch (err) {
    console.error('LinkedIn OAuth callback error:', err);
    return redirectWithCookies(`${url.origin}/?linkedin_auth=error`, [CLEAR_STATE_COOKIE]);
  }
}
