import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import getDb from './db.js';

export const USER_SESSION_COOKIE_NAME = 'mindcare_user_session';
export const USER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const USER_SESSION_MAX_AGE_SECONDS = USER_SESSION_TTL_MS / 1000;

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createUserSession(userId) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expires = new Date(now.getTime() + USER_SESSION_TTL_MS);

  db.prepare(
    'INSERT INTO user_sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).run(token, userId, now.toISOString(), expires.toISOString());

  return { token, expiresAt: expires };
}

export function getUserFromToken(token) {
  if (!token) return null;
  const db = getDb();
  const session = db
    .prepare('SELECT * FROM user_sessions WHERE token = ? AND expires_at > ?')
    .get(token, new Date().toISOString());
  if (!session) return null;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id);
  return user || null;
}

export function destroyUserSession(token) {
  if (!token) return;
  const db = getDb();
  db.prepare('DELETE FROM user_sessions WHERE token = ?').run(token);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}
