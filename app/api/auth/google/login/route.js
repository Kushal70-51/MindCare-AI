import { randomBytes } from 'crypto';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = ['openid', 'email', 'profile'].join(' ');

export async function GET(request) {
  const url = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

  if (!clientId) {
    return Response.json(
      { error: 'Google sign-in is not configured on the server yet (missing GOOGLE_CLIENT_ID).' },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${GOOGLE_AUTH_URL}?${params.toString()}`,
      'Set-Cookie': `google_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
