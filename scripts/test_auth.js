const assert = require('assert');
const path = require('path');
const Database = require('better-sqlite3');

(async () => {
  console.log('--- TEST 1: GET /api/auth/oauth ---');
  const res1 = await fetch('http://localhost:3000/api/auth/oauth');
  const data1 = await res1.json();
  assert(data1.providers.google, 'Google provider missing');
  assert(!data1.providers.microsoft, 'Microsoft provider should not exist');
  console.log('PASS: Only Google is returned in providers.');

  console.log('--- TEST 2: POST /api/auth/oauth with Microsoft ---');
  const res2 = await fetch('http://localhost:3000/api/auth/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'microsoft', email: 'test@outlook.com' })
  });
  assert.strictEqual(res2.status, 400, 'Microsoft should be rejected with 400');
  console.log('PASS: Microsoft rejected with 400.');

  console.log('--- TEST 3: POST /api/auth/oauth with Google ---');
  const res3 = await fetch('http://localhost:3000/api/auth/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', email: 'test.patient@gmail.com', fullName: 'Test Patient User' })
  });
  const data3 = await res3.json();
  assert.strictEqual(res3.status, 200, 'Google login should succeed');
  assert.strictEqual(data3.user.email, 'test.patient@gmail.com');
  assert.strictEqual(data3.user.auth_provider, 'google');
  console.log('PASS: Google user authenticated successfully.');

  const dbCleanup = new Database(path.join(__dirname, '..', 'data', 'mindcare.sqlite'));
  const testU = dbCleanup.prepare('SELECT id FROM users WHERE email = ?').get('test.patient@gmail.com');
  if (testU) {
    dbCleanup.prepare('DELETE FROM user_sessions WHERE user_id = ?').run(testU.id);
    dbCleanup.prepare('DELETE FROM users WHERE id = ?').run(testU.id);
  }

  console.log('--- TEST 4: GET /api/auth/google/login 302 redirect ---');
  const res4 = await fetch('http://localhost:3000/api/auth/google/login', { redirect: 'manual' });
  assert.strictEqual(res4.status, 302, 'Should return 302 redirect');
  const location = res4.headers.get('location');
  assert(location.includes('accounts.google.com'), 'Should redirect to accounts.google.com');
  assert(location.includes('openid'), 'Should request openid scope');
  console.log('PASS: Google OAuth redirect URL is correctly formed: ' + location.substring(0, 60) + '...');

  console.log('--- TEST 5: Verify Alex Vance is not in SQLite ---');
  const db = new Database(path.join(__dirname, '..', 'data', 'mindcare.sqlite'));
  const alex = db.prepare("SELECT * FROM users WHERE lower(full_name) LIKE '%alex vance%' OR lower(email) LIKE '%alex.vance%'").all();
  assert.strictEqual(alex.length, 0, 'Alex Vance records found in DB');
  console.log('PASS: No Alex Vance in SQLite users table.');

  console.log('\n>>> ALL 5 API & BACKEND TESTS PASSED SUCCESSFULLY! <<<');
})().catch(err => {
  console.error('FAIL:', err);
  process.exit(1);
});
