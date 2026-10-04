import { randomBytes, createHash } from 'crypto';

const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const SCOPE = 'tweet.read users.read offline.access';

function base64UrlEncode(str) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function GET() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/api/auth/twitter/callback';

  if (!clientId) {
    return Response.json(
      {
        error: 'Twitter Client ID is not configured yet in .env.local. You can also connect live by entering your Twitter handle or Bearer token!',
        setupTip: 'Add TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET to .env.local from developer.x.com',
      },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString('hex');
  const codeVerifier = randomBytes(32).toString('hex');
  const codeChallenge = base64UrlEncode(createHash('sha256').update(codeVerifier).digest());

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${TWITTER_AUTH_URL}?${params.toString()}`,
      'Set-Cookie': `tw_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
