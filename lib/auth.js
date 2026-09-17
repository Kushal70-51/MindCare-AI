import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import getDb from './db';

const SESSION_COOKIE = 'mindcare_doctor_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createSession(doctorId) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_MS);

  db.prepare(
    'INSERT INTO sessions (token, doctor_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).run(token, doctorId, now.toISOString(), expires.toISOString());

  return { token, expiresAt: expires };
}

export function getDoctorFromToken(token) {
  if (!token) return null;
  const db = getDb();
  const session = db
    .prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?')
    .get(token, new Date().toISOString());
  if (!session) return null;

  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(session.doctor_id);
  return doctor || null;
}

export function destroySession(token) {
  if (!token) return;
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function sanitizeDoctor(doctor) {
  if (!doctor) return null;
  const { password_hash, certificate_data, ...safe } = doctor;
  return safe;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
