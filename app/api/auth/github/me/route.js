import { getValidAccessToken } from '../../../../../lib/githubAuth';

export async function GET(request) {
  const { accessToken } = await getValidAccessToken(request);
  if (!accessToken) {
    return Response.json({ connected: false });
  }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'MindCareAI-Health-Platform',
      },
    });
    const data = await res.json();
    if (!res.ok || !data.login) {
      return Response.json({ connected: false });
    }

    return Response.json({
      connected: true,
      username: data.login,
      name: data.name,
      avatarUrl: data.avatar_url,
      publicRepos: data.public_repos,
    });
  } catch (err) {
    console.error('GitHub /me error:', err);
    return Response.json({ connected: false });
  }
}
