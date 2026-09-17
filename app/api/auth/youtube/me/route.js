import { getValidAccessToken } from '../../../../../lib/youtubeAuth';

export async function GET(request) {
  const { accessToken, refreshedCookie } = await getValidAccessToken(request);
  if (!accessToken) {
    return Response.json({ connected: false });
  }

  try {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    const channel = data.items?.[0];
    if (!res.ok || !channel) {
      return Response.json({ connected: false });
    }

    const body = Response.json({
      connected: true,
      channelTitle: channel.snippet.title,
      thumbnailUrl: channel.snippet.thumbnails?.default?.url,
      subscriberCount: channel.statistics?.subscriberCount,
    });
    if (refreshedCookie) body.headers.append('Set-Cookie', refreshedCookie);
    return body;
  } catch (err) {
    console.error('YouTube /me error:', err);
    return Response.json({ connected: false });
  }
}
