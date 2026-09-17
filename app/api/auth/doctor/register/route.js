import crypto from 'node:crypto';
import getDb from '../../../../../lib/db';
import { hashPassword } from '../../../../../lib/auth';

const MAX_CERT_BASE64_LENGTH = 3 * 1024 * 1024; // ~2MB file, base64-inflated

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    fullName,
    email,
    password,
    licenseNumber,
    specialty,
    hospitalAffiliation,
    yearsExperience,
    certificateFilename,
    certificateData,
    city,
    latitude,
    longitude,
  } = body || {};

  if (!fullName || !email || !password || !licenseNumber || !specialty) {
    return Response.json(
      { error: 'Full name, email, password, license number, and specialty are required.' },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  if (!certificateData || !certificateFilename) {
    return Response.json(
      { error: 'A certificate/license document must be uploaded for verification.' },
      { status: 400 }
    );
  }
  if (certificateData.length > MAX_CERT_BASE64_LENGTH) {
    return Response.json({ error: 'Certificate file is too large (max ~2MB).' }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM doctors WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return Response.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  db.prepare(
    `INSERT INTO doctors
      (id, full_name, email, password_hash, license_number, specialty, hospital_affiliation,
       years_experience, certificate_filename, certificate_data, verification_status, created_at,
       city, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`
  ).run(
    id,
    fullName,
    email.toLowerCase(),
    passwordHash,
    licenseNumber,
    specialty,
    hospitalAffiliation || null,
    yearsExperience ? Number(yearsExperience) : null,
    certificateFilename,
    certificateData,
    new Date().toISOString(),
    city || null,
    typeof latitude === 'number' ? latitude : null,
    typeof longitude === 'number' ? longitude : null
  );

  return Response.json({
    success: true,
    message:
      "Registration submitted. Your account is pending manual verification — you'll be able to log in once an administrator approves your credentials.",
  });
}
