import { cookies } from 'next/headers';
import { destroyUserSession, USER_SESSION_COOKIE_NAME } from '../../../../../lib/userAuth';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE_NAME)?.value;
  if (token) {
    destroyUserSession(token);
    cookieStore.delete(USER_SESSION_COOKIE_NAME);
  }
  return Response.json({ success: true });
}
