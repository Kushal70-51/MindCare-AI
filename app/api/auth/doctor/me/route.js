import { cookies } from 'next/headers';
import { getDoctorFromToken, sanitizeDoctor, SESSION_COOKIE_NAME } from '../../../../../lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const doctor = getDoctorFromToken(token);

  if (!doctor) {
    return Response.json({ doctor: null }, { status: 200 });
  }
  return Response.json({ doctor: sanitizeDoctor(doctor) });
}
