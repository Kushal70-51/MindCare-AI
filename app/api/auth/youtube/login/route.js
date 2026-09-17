// Kicks off real "Sign in with Google" for read-only YouTube access
// (subscriptions, liked videos, own channel stats). This is a genuine OAuth
// 2.0 authorization-code flow against Google's endpoints — not a mock.
import { randomBytes } from 'crypto';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

export async function GET() {
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.YOUTUBE_OAUTH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return Response.json(
      { error: 'YouTube sign-in is not configured on the server yet (missing OAuth client credentials).' },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  // Response.redirect() returns a Response with immutable/opaque headers in
  // Next.js's route runtime — appending a Set-Cookie to it throws. Building
  // the redirect manually keeps the headers mutable.
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${GOOGLE_AUTH_URL}?${params.toString()}`,
      'Set-Cookie': `yt_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
