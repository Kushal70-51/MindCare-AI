// Fetches public comments for a YouTube video via the official YouTube Data
// API v3. Server-side only, so the API key never reaches the browser.
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_COMMENTS = 40;

function extractVideoId(input) {
  const trimmed = (input || '').trim();
  // Bare 11-char video ID pasted directly.
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1).split('/')[0] || null;
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.searchParams.get('v')) return url.searchParams.get('v');
      const match = url.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/);
      if (match) return match[2];
    }
  } catch {
    // Not a valid URL — fall through to null.
  }
  return null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { videoUrl } = body || {};
  if (!videoUrl || typeof videoUrl !== 'string') {
    return Response.json({ error: 'videoUrl is required' }, { status: 400 });
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return Response.json(
      { error: 'Could not recognize a YouTube video ID in that link. Paste a full video URL (e.g. https://www.youtube.com/watch?v=...).' },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'YouTube analysis is not configured on the server (missing API key).' }, { status: 500 });
  }

  try {
    const videoRes = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
    );
    const videoData = await videoRes.json();

    if (!videoRes.ok) {
      console.error('YouTube videos API error:', videoData);
      return Response.json({ error: 'Could not reach YouTube. Please try again shortly.' }, { status: 502 });
    }
    const video = videoData.items?.[0];
    if (!video) {
      return Response.json({ error: 'No video found for that link.' }, { status: 404 });
    }

    const commentsRes = await fetch(
      `${YOUTUBE_API_BASE}/commentThreads?part=snippet&videoId=${videoId}&maxResults=${MAX_COMMENTS}&order=relevance&textFormat=plainText&key=${apiKey}`
    );
    const commentsData = await commentsRes.json();

    if (!commentsRes.ok) {
      const reason = commentsData?.error?.errors?.[0]?.reason;
      if (reason === 'commentsDisabled') {
        return Response.json({ error: 'Comments are disabled on this video.' }, { status: 422 });
      }
      console.error('YouTube commentThreads API error:', commentsData);
      return Response.json({ error: 'Could not fetch comments for that video. Please try again shortly.' }, { status: 502 });
    }

    const comments = (commentsData.items || []).map((item) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        text: snippet.textDisplay,
        author: snippet.authorDisplayName,
        likeCount: snippet.likeCount,
        publishedAt: snippet.publishedAt,
      };
    });

    return Response.json({
      videoId,
      videoTitle: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnailUrl: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
      commentCount: video.statistics?.commentCount,
      comments,
    });
  } catch (err) {
    console.error('YouTube comments route error:', err);
    return Response.json({ error: 'Something went wrong reaching YouTube. Please try again.' }, { status: 500 });
  }
}
