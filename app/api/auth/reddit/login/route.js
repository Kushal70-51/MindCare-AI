// Kicks off real "Sign in with Reddit" for read-only access (subscribed
// subreddits, recent comments/posts with real timestamps). Genuine OAuth 2.0
// authorization-code flow against Reddit's endpoints — mirrors the YouTube
// login route (see its comments for why the redirect is built manually
// instead of via Response.redirect()).
import { randomBytes } from 'crypto';

const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize';
const SCOPE = 'identity mysubreddits history';

export async function GET() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const redirectUri = process.env.REDDIT_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return Response.json(
      { error: 'Reddit sign-in is not configured on the server yet (missing OAuth client credentials).' },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    state,
    redirect_uri: redirectUri,
    duration: 'permanent',
    scope: SCOPE,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${REDDIT_AUTH_URL}?${params.toString()}`,
      'Set-Cookie': `reddit_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
