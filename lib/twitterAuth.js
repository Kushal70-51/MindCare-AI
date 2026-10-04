// Shared helpers for reading Twitter / X OAuth cookies
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
  if (cookies['tw_access_token']) {
    return { accessToken: cookies['tw_access_token'], refreshedCookie: null };
  }
  return { accessToken: null, refreshedCookie: null };
}
