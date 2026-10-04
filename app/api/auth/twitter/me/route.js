import { getValidAccessToken } from '../../../../../lib/twitterAuth';

export async function GET(request) {
  const { accessToken } = await getValidAccessToken(request);
  if (!accessToken) {
    return Response.json({ connected: false });
  }

  try {
    const res = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,description', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok || !data.data?.username) {
      return Response.json({ connected: false });
    }

    return Response.json({
      connected: true,
      username: data.data.username,
      name: data.data.name,
      avatarUrl: data.data.profile_image_url,
    });
  } catch (err) {
    console.error('Twitter /me error:', err);
    return Response.json({ connected: false });
  }
}
