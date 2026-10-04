import { getValidAccessToken } from '../../../../lib/twitterAuth';

export async function GET(request) {
  const url = new URL(request.url);
  const paramUsername = url.searchParams.get('username');

  let username = paramUsername;
  let bearer = process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN;

  const auth = await getValidAccessToken(request);
  if (auth.accessToken) {
    bearer = auth.accessToken;
  }

  if (!username && auth.accessToken) {
    try {
      const meRes = await fetch('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      const meData = await meRes.json();
      username = meData.data?.username;
    } catch (e) {
      console.warn('Twitter user lookup error:', e);
    }
  }

  if (!username) {
    return Response.json({ error: 'Please provide a Twitter username or sign in with Twitter (X).' }, { status: 400 });
  }

  const cleanUser = username.replace(/^@/, '').trim();

  // If bearer token exists, query Twitter v2 API
  if (bearer) {
    try {
      const userLookupRes = await fetch(`https://api.twitter.com/2/users/by/username/${encodeURIComponent(cleanUser)}?user.fields=description,profile_image_url`, {
        headers: { Authorization: `Bearer ${bearer}` },
      });
      const userLookupData = await userLookupRes.json();
      const userId = userLookupData.data?.id;

      if (userId) {
        const tweetsRes = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at&max_results=20`, {
          headers: { Authorization: `Bearer ${bearer}` },
        });
        const tweetsData = await tweetsRes.json();
        const recentTweets = (tweetsData.data || []).map((t) => ({
          text: t.text,
          createdAt: t.created_at,
        }));

        return Response.json({
          username: cleanUser,
          name: userLookupData.data?.name || cleanUser,
          avatarUrl: userLookupData.data?.profile_image_url,
          bio: userLookupData.data?.description,
          recentTweets,
          source: 'Twitter API v2',
        });
      }
    } catch (err) {
      console.error('Twitter API route error:', err);
    }
  }

  return Response.json({
    username: cleanUser,
    message: 'To fetch live Twitter API tweets, set TWITTER_BEARER_TOKEN in .env.local or sign in with Twitter OAuth.',
    recentTweets: [],
    source: 'Twitter Direct Handle',
  });
}
