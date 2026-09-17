// Real "what does the signed-in user actually do on Reddit" data —
// subscribed subreddits (topic/interest profile) + recent comments (real
// text, for sentiment) + recent posts, both with real `created_utc`
// timestamps of the user's own activity. Mirrors
// app/api/social/youtube-profile/route.js.
import { getValidAccessToken } from '../../../../lib/redditAuth';

const REDDIT_API_BASE = 'https://oauth.reddit.com';
const MAX_SUBREDDITS = 30;
const MAX_COMMENTS = 25;
const MAX_POSTS = 25;

async function redditGet(path, accessToken) {
  const res = await fetch(`${REDDIT_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': process.env.REDDIT_USER_AGENT || 'web:mindcare-ai:v1.0',
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Reddit API request failed');
  return data;
}

export async function GET(request) {
  const { accessToken, refreshedCookie } = await getValidAccessToken(request);
  if (!accessToken) {
    return Response.json({ error: 'Not signed in with Reddit.' }, { status: 401 });
  }

  try {
    const me = await redditGet('/api/v1/me', accessToken);
    const username = me.name;
    if (!username) {
      return Response.json({ error: 'Could not read your Reddit account.' }, { status: 404 });
    }

    const subsData = await redditGet(`/subreddits/mine/subscriber?limit=${MAX_SUBREDDITS}`, accessToken);
    const subscribedSubreddits = (subsData.data?.children || []).map((c) => ({
      name: c.data.display_name_prefixed,
      subscribers: c.data.subscribers,
    }));

    const commentsData = await redditGet(
      `/user/${username}/comments?limit=${MAX_COMMENTS}&sort=new`,
      accessToken
    );
    const recentComments = (commentsData.data?.children || [])
      .map((c) => ({
        body: c.data.body,
        subreddit: c.data.subreddit_name_prefixed,
        createdAt: c.data.created_utc ? new Date(c.data.created_utc * 1000).toISOString() : null,
      }))
      .filter((c) => c.body && c.body !== '[deleted]' && c.body !== '[removed]');

    const postsData = await redditGet(
      `/user/${username}/submitted?limit=${MAX_POSTS}&sort=new`,
      accessToken
    );
    const recentPosts = (postsData.data?.children || [])
      .map((c) => ({
        title: c.data.title,
        subreddit: c.data.subreddit_name_prefixed,
        createdAt: c.data.created_utc ? new Date(c.data.created_utc * 1000).toISOString() : null,
      }))
      .filter((p) => p.title);

    const body = Response.json({
      username,
      subscribedSubreddits,
      recentComments,
      recentPosts,
    });
    if (refreshedCookie) body.headers.append('Set-Cookie', refreshedCookie);
    return body;
  } catch (err) {
    console.error('Reddit profile route error:', err);
    return Response.json({ error: 'Could not fetch your Reddit activity right now.' }, { status: 502 });
  }
}
