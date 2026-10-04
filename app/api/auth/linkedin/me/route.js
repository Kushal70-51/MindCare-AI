import { getValidAccessToken } from '../../../../../lib/linkedinAuth';

export async function GET(request) {
  const { accessToken } = await getValidAccessToken(request);
  if (!accessToken) {
    return Response.json({ connected: false });
  }

  try {
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok || !data.sub) {
      return Response.json({ connected: false });
    }

    return Response.json({
      connected: true,
      name: data.name,
      email: data.email,
      avatarUrl: data.picture,
    });
  } catch (err) {
    console.error('LinkedIn /me error:', err);
    return Response.json({ connected: false });
  }
}
