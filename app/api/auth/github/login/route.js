import { randomBytes } from 'crypto';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const SCOPE = 'read:user user:email';

export async function GET() {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback';

  if (!clientId) {
    return Response.json(
      {
        error: 'GitHub OAuth Client ID is not configured yet in .env.local. You can still connect live data instantly by entering your GitHub username!',
        setupTip: 'Add GITHUB_OAUTH_CLIENT_ID to .env.local from github.com/settings/developers'
      },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPE,
    state,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${GITHUB_AUTH_URL}?${params.toString()}`,
      'Set-Cookie': `gh_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
