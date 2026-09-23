import { cookies } from 'next/headers';
import { getUserFromToken, sanitizeUser, USER_SESSION_COOKIE_NAME } from '../../../../../lib/userAuth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE_NAME)?.value;
  const user = getUserFromToken(token);

  if (!user) {
    return Response.json({ authenticated: false, user: null });
  }

  return Response.json({ authenticated: true, user: sanitizeUser(user) });
}
