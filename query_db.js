const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'lms.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('OPEN ERROR', err.message);
    process.exit(1);
  }
});

const q = (sql) => new Promise((resolve, reject) => db.all(sql, (err, rows) => err ? reject(err) : resolve(rows)));

Promise.all([
  q('SELECT COUNT(*) AS c FROM users'),
  q("SELECT email, role, name, section, department, semester, registrationNo, employeeId FROM users WHERE email IN ('admin@college.com','faculty@college.com','student@college.com','admin@lms.com','priya@lms.com','aman@lms.com')"),
  q('SELECT COUNT(*) AS c FROM courses'),
  q('SELECT COUNT(*) AS c FROM packets'),
  q('SELECT COUNT(*) AS c FROM notifications'),
])
  .then(([u, users, c, p, n]) => {
    console.log('USERS', u[0].c, 'COURSES', c[0].c, 'PACKETS', p[0].c, 'NOTIFICATIONS', n[0].c);
    console.log(JSON.stringify(users, null, 2));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.close());

