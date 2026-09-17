// Real social-media contextual signal: fetches public comments for a YouTube
// video (via app/api/social/youtube-comments, which wraps the YouTube Data
// API v3) and classifies each one with the same in-browser emotion model
// used for interview answers (utils/speechEmotion.ts), then aggregates the
// distribution — the same "live pretrained model, no fabricated numbers"
// approach used for the facial/linguistic/acoustic signals.
import { classifyTextEmotion, isNegativeEmotion, LinguisticEmotionLabel } from './speechEmotion';
import { parseInstagramExportFile } from './instagramExport';

export interface AnalyzedComment {
  text: string;
  author: string;
  emotion: LinguisticEmotionLabel;
  score: number;
}

export interface SocialInsight {
  videoId: string;
  videoTitle: string;
  channelTitle: string;
  thumbnailUrl?: string;
  analyzedCount: number;
  emotionDistribution: Record<string, number>; // 0-1 share per label
  dominantEmotion: LinguisticEmotionLabel;
  positiveRatio: number;
  negativeRatio: number;
  topComments: AnalyzedComment[]; // a few representative examples for display
}

// Caps how many fetched comments actually get run through the local model —
// keeps the in-browser classification pass fast even on a busy comment thread.
const MAX_ANALYZED = 25;

export async function analyzeYoutubeVideo(videoUrl: string): Promise<SocialInsight> {
  const res = await fetch('/api/social/youtube-comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Could not analyze that video.');
  }

  const comments: Array<{ text: string; author: string }> = (data.comments || []).slice(0, MAX_ANALYZED);
  if (comments.length === 0) {
    throw new Error('No comments were available to analyze on that video.');
  }

  const analyzed: AnalyzedComment[] = [];
  for (const c of comments) {
    const result = await classifyTextEmotion(c.text);
    if (result) {
      analyzed.push({ text: c.text, author: c.author, emotion: result.label, score: result.score });
    }
  }

  if (analyzed.length === 0) {
    throw new Error('Comments on this video were too short to analyze.');
  }

  const counts: Record<string, number> = {};
  analyzed.forEach((a) => {
    counts[a.emotion] = (counts[a.emotion] || 0) + 1;
  });
  const emotionDistribution: Record<string, number> = {};
  Object.entries(counts).forEach(([label, count]) => {
    emotionDistribution[label] = count / analyzed.length;
  });

  const dominantEmotion = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'neutral') as LinguisticEmotionLabel;

  const positiveRatio = (counts.joy || 0) / analyzed.length;
  const negativeCount = analyzed.filter((a) => isNegativeEmotion(a.emotion)).length;
  const negativeRatio = negativeCount / analyzed.length;

  // A small representative sample: the highest-confidence comment per
  // distinct emotion label that actually showed up, capped at 4.
  const byEmotion = new Map<string, AnalyzedComment>();
  analyzed.forEach((a) => {
    const existing = byEmotion.get(a.emotion);
    if (!existing || a.score > existing.score) byEmotion.set(a.emotion, a);
  });
  const topComments = Array.from(byEmotion.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return {
    videoId: data.videoId,
    videoTitle: data.videoTitle,
    channelTitle: data.channelTitle,
    thumbnailUrl: data.thumbnailUrl,
    analyzedCount: analyzed.length,
    emotionDistribution,
    dominantEmotion,
    positiveRatio,
    negativeRatio,
    topComments,
  };
}

// --- Real signed-in-user YouTube activity (OAuth) -------------------------
// Deliberately scoped to what the YouTube Data API actually exposes with
// user consent: subscriptions (interest/topic profile) + liked videos
// (positive-engagement content) + own channel stats. Watch history and
// session/usage time are NOT available through this API for any app, so
// they're never claimed here.

export interface YoutubeConnectionStatus {
  connected: boolean;
  channelTitle?: string;
  thumbnailUrl?: string;
  subscriberCount?: string;
}

export interface YoutubeProfileInsight {
  channelTitle: string;
  subscriberCount?: string;
  videoCount?: string;
  subscriptions: Array<{ title: string; thumbnailUrl?: string; subscribedAt?: string }>;
  likedVideos: Array<{ title: string; channelTitle?: string; likedAt?: string }>;
  analyzedLikedCount: number;
  emotionDistribution: Record<string, number>;
  dominantEmotion: LinguisticEmotionLabel;
  positiveRatio: number;
  negativeRatio: number;
}

export interface ActivityTimeSegment {
  segment: string;
  count: number;
  percentage: number;
}

export interface YoutubeActivityInsight {
  activityPattern: string;
  lifestyleSignal: string;
  contentThemeNote: string;
  summary: string;
  distribution: ActivityTimeSegment[];
}

export async function checkYoutubeConnection(): Promise<YoutubeConnectionStatus> {
  const res = await fetch('/api/auth/youtube/me');
  if (!res.ok) return { connected: false };
  return res.json();
}

export async function disconnectYoutubeAccount(): Promise<void> {
  await fetch('/api/auth/youtube/logout', { method: 'POST' });
}

export async function fetchYoutubeProfileInsight(): Promise<YoutubeProfileInsight> {
  const res = await fetch('/api/social/youtube-profile');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Could not read your YouTube activity.');
  }

  const likedTitles: string[] = (data.likedVideos || []).map((v: { title: string }) => v.title).slice(0, 20);

  const emotions: LinguisticEmotionLabel[] = [];
  for (const title of likedTitles) {
    const result = await classifyTextEmotion(title);
    if (result) emotions.push(result.label);
  }

  const counts: Record<string, number> = {};
  emotions.forEach((label) => {
    counts[label] = (counts[label] || 0) + 1;
  });
  const emotionDistribution: Record<string, number> = {};
  Object.entries(counts).forEach(([label, count]) => {
    emotionDistribution[label] = count / (emotions.length || 1);
  });
  const dominantEmotion = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'neutral') as LinguisticEmotionLabel;
  const positiveRatio = (counts.joy || 0) / (emotions.length || 1);
  const negativeRatio = emotions.filter((e) => isNegativeEmotion(e)).length / (emotions.length || 1);

  return {
    channelTitle: data.channelTitle,
    subscriberCount: data.subscriberCount,
    videoCount: data.videoCount,
    subscriptions: data.subscriptions || [],
    likedVideos: data.likedVideos || [],
    analyzedLikedCount: emotions.length,
    emotionDistribution,
    dominantEmotion,
    positiveRatio,
    negativeRatio,
  };
}

// Sends the real subscription/like timestamps (plus titles for topical
// context) to app/api/social/youtube-insight, which computes an actual
// time-of-day distribution and has an LLM (Gemini) narrate what it may mean
// for the person's routine/sleep — not a raw stat dump, a written signal
// meant to read naturally inside the clinical report.
export async function generateYoutubeActivityInsight(
  profile: YoutubeProfileInsight
): Promise<YoutubeActivityInsight> {
  const res = await fetch('/api/social/youtube-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscriptions: profile.subscriptions,
      likedVideos: profile.likedVideos,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Could not analyze YouTube activity timing.');
  }
  return data;
}

// --- Real signed-in-user Reddit activity (OAuth) ---------------------------
// Mirrors the YouTube account section above: subscribed subreddits (interest
// profile) + recent comments (real text, for sentiment) + recent posts, both
// with genuine `created_utc` activity timestamps — arguably an even more
// direct activity-timing signal than YouTube's subscribe/like dates, since
// posting/commenting is the user's own authored action.

export interface RedditConnectionStatus {
  connected: boolean;
  username?: string;
  iconUrl?: string;
}

export interface RedditProfileInsight {
  username: string;
  subscribedSubreddits: Array<{ name: string; subscribers?: number }>;
  recentComments: Array<{ body: string; subreddit?: string; createdAt?: string }>;
  recentPosts: Array<{ title: string; subreddit?: string; createdAt?: string }>;
  analyzedCommentCount: number;
  emotionDistribution: Record<string, number>;
  dominantEmotion: LinguisticEmotionLabel;
  positiveRatio: number;
  negativeRatio: number;
}

export interface RedditActivityInsight {
  activityPattern: string;
  lifestyleSignal: string;
  contentThemeNote: string;
  summary: string;
  distribution: ActivityTimeSegment[];
}

export async function checkRedditConnection(): Promise<RedditConnectionStatus> {
  const res = await fetch('/api/auth/reddit/me');
  if (!res.ok) return { connected: false };
  return res.json();
}

export async function disconnectRedditAccount(): Promise<void> {
  await fetch('/api/auth/reddit/logout', { method: 'POST' });
}

export async function fetchRedditProfileInsight(): Promise<RedditProfileInsight> {
  const res = await fetch('/api/social/reddit-profile');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Could not read your Reddit activity.');
  }

  const comments: Array<{ body: string }> = (data.recentComments || []).slice(0, 20);

  const emotions: LinguisticEmotionLabel[] = [];
  for (const c of comments) {
    const result = await classifyTextEmotion(c.body);
    if (result) emotions.push(result.label);
  }

  const counts: Record<string, number> = {};
  emotions.forEach((label) => {
    counts[label] = (counts[label] || 0) + 1;
  });
  const emotionDistribution: Record<string, number> = {};
  Object.entries(counts).forEach(([label, count]) => {
    emotionDistribution[label] = count / (emotions.length || 1);
  });
  const dominantEmotion = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'neutral') as LinguisticEmotionLabel;
  const positiveRatio = (counts.joy || 0) / (emotions.length || 1);
  const negativeRatio = emotions.filter((e) => isNegativeEmotion(e)).length / (emotions.length || 1);

  return {
    username: data.username,
    subscribedSubreddits: data.subscribedSubreddits || [],
    recentComments: data.recentComments || [],
    recentPosts: data.recentPosts || [],
    analyzedCommentCount: emotions.length,
    emotionDistribution,
    dominantEmotion,
    positiveRatio,
    negativeRatio,
  };
}

export async function generateRedditActivityInsight(
  profile: RedditProfileInsight
): Promise<RedditActivityInsight> {
  const res = await fetch('/api/social/reddit-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscribedSubreddits: profile.subscribedSubreddits,
      recentComments: profile.recentComments,
      recentPosts: profile.recentPosts,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Could not analyze Reddit activity timing.');
  }
  return data;
}

// --- Instagram: user's own official data export (no login automation) ----
// Instagram has no individual-developer-friendly OAuth API, and logging in
// on the user's behalf is against their Terms of Service — so unlike
// YouTube/Reddit, this path works from the user's own official "Download
// Your Information" export file instead of a live account connection. See
// utils/instagramExport.ts for the (ZIP/JSON) parsing step; from here it's
// the same "classify with the in-browser model + narrate timing via LLM"
// pipeline as the other two platforms.

export interface InstagramProfileInsight {
  analyzedCount: number;
  emotionDistribution: Record<string, number>;
  dominantEmotion: LinguisticEmotionLabel;
  positiveRatio: number;
  negativeRatio: number;
  sampleTexts: string[];
}

export interface InstagramActivityInsight {
  activityPattern: string;
  lifestyleSignal: string;
  contentThemeNote: string;
  summary: string;
  distribution: ActivityTimeSegment[];
}

export async function analyzeInstagramExport(
  file: File
): Promise<{ profile: InstagramProfileInsight; activity: InstagramActivityInsight }> {
  const entries = await parseInstagramExportFile(file);

  const emotions: LinguisticEmotionLabel[] = [];
  for (const e of entries) {
    const result = await classifyTextEmotion(e.text);
    if (result) emotions.push(result.label);
  }

  const counts: Record<string, number> = {};
  emotions.forEach((label) => {
    counts[label] = (counts[label] || 0) + 1;
  });
  const emotionDistribution: Record<string, number> = {};
  Object.entries(counts).forEach(([label, count]) => {
    emotionDistribution[label] = count / (emotions.length || 1);
  });
  const dominantEmotion = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'neutral') as LinguisticEmotionLabel;
  const positiveRatio = (counts.joy || 0) / (emotions.length || 1);
  const negativeRatio = emotions.filter((e) => isNegativeEmotion(e)).length / (emotions.length || 1);

  const profile: InstagramProfileInsight = {
    analyzedCount: emotions.length,
    emotionDistribution,
    dominantEmotion,
    positiveRatio,
    negativeRatio,
    sampleTexts: entries.slice(0, 8).map((e) => e.text),
  };

  const res = await fetch('/api/social/instagram-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entries,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
  const activity = await res.json();
  if (!res.ok) {
    throw new Error(activity?.error || 'Could not analyze Instagram activity timing.');
  }

  return { profile, activity };
}
