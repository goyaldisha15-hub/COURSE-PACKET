const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database', 'lms.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
db.all("SELECT email, role, department, section, semester FROM users WHERE email='faculty@college.com' OR email='student@college.com'", (err, rows) => {
  if (err) return console.error(err);
  console.log("USERS", JSON.stringify(rows, null, 2));
  db.close();
});
