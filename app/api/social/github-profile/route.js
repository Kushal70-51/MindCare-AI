import { getValidAccessToken } from '../../../../lib/githubAuth';

export async function GET(request) {
  const url = new URL(request.url);
  const paramUsername = url.searchParams.get('username');

  let username = paramUsername;
  let accessToken = null;

  if (!username) {
    const auth = await getValidAccessToken(request);
    accessToken = auth.accessToken;
    if (accessToken) {
      try {
        const meRes = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'MindCareAI-Health-Platform',
          },
        });
        const meData = await meRes.json();
        username = meData.login;
      } catch (err) {
        console.warn('GitHub user fetch error:', err);
      }
    }
  }

  if (!username) {
    return Response.json({ error: 'Please provide a GitHub username or sign in with GitHub.' }, { status: 400 });
  }

  try {
    const cleanUser = username.replace(/^@/, '').trim();
    const headers = { 'User-Agent': 'MindCareAI-Health-Platform' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    // 1. Fetch user public profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, { headers });
    const userData = await userRes.json();

    // 2. Fetch public events
    const eventsRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/events/public?per_page=25`, { headers });
    const events = await eventsRes.json();

    const commitList = [];
    let nocturnalCount = 0;

    (Array.isArray(events) ? events : []).forEach((ev) => {
      const createdDate = new Date(ev.created_at);
      const hour = createdDate.getHours();
      if (hour >= 23 || hour <= 4) {
        nocturnalCount++;
      }

      if (ev.type === 'PushEvent') {
        const commits = ev.payload?.commits || [];
        commits.forEach((c) => {
          commitList.push({
            repo: ev.repo?.name,
            message: c.message,
            timestamp: ev.created_at,
            hour,
          });
        });
      }
    });

    return Response.json({
      username: cleanUser,
      name: userData.name || cleanUser,
      avatarUrl: userData.avatar_url,
      bio: userData.bio,
      publicRepos: userData.public_repos || 0,
      totalEvents: Array.isArray(events) ? events.length : 0,
      recentCommits: commitList.slice(0, 15),
      nocturnalActivityCount: nocturnalCount,
      circadianRisk: nocturnalCount >= 3 ? 'High' : nocturnalCount > 0 ? 'Moderate' : 'Low',
    });
  } catch (err) {
    console.error('GitHub profile route error:', err);
    return Response.json({ error: 'Could not fetch GitHub activity right now.' }, { status: 502 });
  }
}
