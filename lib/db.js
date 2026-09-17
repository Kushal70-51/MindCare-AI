import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'mindcare.sqlite');

// Next.js dev mode re-evaluates modules on every hot reload — cache the
// connection on `global` so we don't open a new SQLite handle each time.
function getDb() {
  if (!global.__mindcareDb) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        license_number TEXT NOT NULL,
        specialty TEXT NOT NULL,
        hospital_affiliation TEXT,
        years_experience INTEGER,
        certificate_filename TEXT,
        certificate_data TEXT,
        verification_status TEXT NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        created_at TEXT NOT NULL,
        verified_at TEXT,
        city TEXT,
        latitude REAL,
        longitude REAL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        doctor_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
      );

      CREATE TABLE IF NOT EXISTS shared_reports (
        id TEXT PRIMARY KEY,
        doctor_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_email TEXT NOT NULL,
        report_json TEXT NOT NULL,
        shared_at TEXT NOT NULL,
        reviewed INTEGER NOT NULL DEFAULT 0,
        doctor_notes TEXT,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        shared_report_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        message_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (shared_report_id) REFERENCES shared_reports(id)
      );
    `);

    // CREATE TABLE IF NOT EXISTS above is a no-op on a database file created
    // before the city/latitude/longitude columns existed — add them here if
    // missing so existing local dev databases pick up the new columns too.
    const existingColumns = db.prepare('PRAGMA table_info(doctors)').all().map((c) => c.name);
    if (!existingColumns.includes('city')) db.exec('ALTER TABLE doctors ADD COLUMN city TEXT');
    if (!existingColumns.includes('latitude')) db.exec('ALTER TABLE doctors ADD COLUMN latitude REAL');
    if (!existingColumns.includes('longitude')) db.exec('ALTER TABLE doctors ADD COLUMN longitude REAL');

    global.__mindcareDb = db;
  }
  return global.__mindcareDb;
}

export default getDb;
