const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

const CLEAR_STATE_COOKIE = 'gh_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

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
  const expectedState = cookies['gh_oauth_state'];

  if (errorParam) {
    return redirectWithCookies(`${url.origin}/?github_auth=denied`, [CLEAR_STATE_COOKIE]);
  }

  if (!code || !state || state !== expectedState) {
    return redirectWithCookies(`${url.origin}/?github_auth=error`, [CLEAR_STATE_COOKIE]);
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback';

  try {
    const tokenRes = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData);
      return redirectWithCookies(`${url.origin}/?github_auth=error`, [CLEAR_STATE_COOKIE]);
    }

    const setCookie = `gh_access_token=${tokenData.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
    return redirectWithCookies(`${url.origin}/?github_auth=success`, [CLEAR_STATE_COOKIE, setCookie]);
  } catch (err) {
    console.error('GitHub OAuth callback error:', err);
    return redirectWithCookies(`${url.origin}/?github_auth=error`, [CLEAR_STATE_COOKIE]);
  }
}
