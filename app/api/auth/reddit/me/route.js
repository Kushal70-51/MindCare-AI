import { getValidAccessToken } from '../../../../../lib/redditAuth';

export async function GET(request) {
  const { accessToken, refreshedCookie } = await getValidAccessToken(request);
  if (!accessToken) {
    return Response.json({ connected: false });
  }

  try {
    const res = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'web:mindcare-ai:v1.0',
      },
    });
    const data = await res.json();
    if (!res.ok || !data.name) {
      return Response.json({ connected: false });
    }

    const body = Response.json({
      connected: true,
      username: data.name,
      iconUrl: data.icon_img ? data.icon_img.split('?')[0] : undefined,
    });
    if (refreshedCookie) body.headers.append('Set-Cookie', refreshedCookie);
    return body;
  } catch (err) {
    console.error('Reddit /me error:', err);
    return Response.json({ connected: false });
  }
}
