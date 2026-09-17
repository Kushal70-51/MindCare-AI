// Real "what does the signed-in user actually engage with on YouTube" data —
// subscriptions (topic/creator interests) + liked videos (positive-engagement
// content) + own channel stats. Uses the access token from the OAuth cookies
// set by app/api/auth/youtube/{login,callback}. Watch history / session time
// is deliberately NOT attempted here — YouTube Data API does not expose it to
// any third-party app, regardless of consent (see lib/youtubeAuth.js note).
import { getValidAccessToken } from '../../../../lib/youtubeAuth';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_SUBSCRIPTIONS = 25;
const MAX_LIKED_VIDEOS = 20;

async function googleGet(path, accessToken) {
  const res = await fetch(`${YOUTUBE_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'YouTube API request failed');
  return data;
}

export async function GET(request) {
  const { accessToken, refreshedCookie } = await getValidAccessToken(request);
  if (!accessToken) {
    return Response.json({ error: 'Not signed in with YouTube.' }, { status: 401 });
  }

  try {
    const channelData = await googleGet(
      '/channels?part=snippet,statistics,contentDetails&mine=true',
      accessToken
    );
    const channel = channelData.items?.[0];
    if (!channel) {
      return Response.json({ error: 'Could not read your YouTube channel.' }, { status: 404 });
    }

    const subsData = await googleGet(
      `/subscriptions?part=snippet&mine=true&maxResults=${MAX_SUBSCRIPTIONS}&order=relevance`,
      accessToken
    );
    // `publishedAt` here is when the user subscribed (not when the channel
    // itself was created) — a real timestamp of the user's own activity.
    const subscriptions = (subsData.items || []).map((item) => ({
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails?.default?.url,
      subscribedAt: item.snippet.publishedAt,
    }));

    const likesPlaylistId = channel.contentDetails?.relatedPlaylists?.likes;
    let likedVideos = [];
    if (likesPlaylistId) {
      const likedData = await googleGet(
        `/playlistItems?part=snippet&playlistId=${likesPlaylistId}&maxResults=${MAX_LIKED_VIDEOS}`,
        accessToken
      );
      // `publishedAt` here is when the video was added to the Likes playlist
      // — i.e. when the user liked it — a real timestamp of user activity,
      // not the video's upload date.
      likedVideos = (likedData.items || [])
        .map((item) => ({
          title: item.snippet.title,
          channelTitle: item.snippet.videoOwnerChannelTitle,
          likedAt: item.snippet.publishedAt,
        }))
        .filter((v) => v.title && v.title !== 'Private video' && v.title !== 'Deleted video');
    }

    const body = Response.json({
      channelTitle: channel.snippet.title,
      subscriberCount: channel.statistics?.subscriberCount,
      videoCount: channel.statistics?.videoCount,
      subscriptions,
      likedVideos,
    });
    if (refreshedCookie) body.headers.append('Set-Cookie', refreshedCookie);
    return body;
  } catch (err) {
    console.error('YouTube profile route error:', err);
    return Response.json({ error: 'Could not fetch your YouTube activity right now.' }, { status: 502 });
  }
}
