import { randomBytes } from 'crypto';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const SCOPE = 'openid profile email';

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';

  if (!clientId) {
    return Response.json(
      {
        error: 'LinkedIn Client ID is not configured yet in .env.local. You can also connect live by entering your LinkedIn public profile handle!',
        setupTip: 'Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env.local from linkedin.com/developers',
      },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: SCOPE,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${LINKEDIN_AUTH_URL}?${params.toString()}`,
      'Set-Cookie': `li_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
