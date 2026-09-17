import { cookies } from 'next/headers';
import { destroySession, SESSION_COOKIE_NAME } from '../../../../../lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  destroySession(token);
  cookieStore.delete(SESSION_COOKIE_NAME);
  return Response.json({ success: true });
}
