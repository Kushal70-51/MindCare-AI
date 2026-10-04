// Shared helpers for reading/refreshing httpOnly GitHub OAuth cookies
// Mirrors lib/youtubeAuth.js and lib/redditAuth.js

export function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

export async function getValidAccessToken(request) {
  const cookies = parseCookies(request.headers?.get ? request.headers.get('cookie') : request);
  if (cookies['gh_access_token']) {
    return { accessToken: cookies['gh_access_token'], refreshedCookie: null };
  }
  return { accessToken: null, refreshedCookie: null };
}
