export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append('Set-Cookie', 'reddit_access_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.headers.append('Set-Cookie', 'reddit_refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return res;
}
