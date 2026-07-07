import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../database/lms.db");

let db = null;

export function getDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err);
      } else {
        console.log("Connected to SQLite database at", dbPath);
      }
    });
  }
  return db;
}

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    
    db.serialize(() => {
      // Check if tables exist before creating them
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, tables) => {
          if (err) {
            reject(err);
            return;
          }

          if (tables.length === 0) {
            console.log("Creating database tables...");
            
            // Users table
            db.run(
              `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('admin', 'faculty', 'student')),
                section TEXT,
                accessSections TEXT DEFAULT '[]',
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
              )`,
              (err) => {
                if (err) console.error("Error creating users table:", err);
              }
            );

            // Courses table
            db.run(
              `CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                code TEXT UNIQUE NOT NULL,
                section TEXT NOT NULL,
                facultyId INTEGER,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(facultyId) REFERENCES users(id)
              )`,
              (err) => {
                if (err) console.error("Error creating courses table:", err);
              }
            );

            // Packets table
            db.run(
              `CREATE TABLE IF NOT EXISTS packets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                course TEXT NOT NULL,
                description TEXT,
                facultyEmail TEXT NOT NULL,
                submittedBy TEXT NOT NULL,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
                remarks TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
              )`,
              (err) => {
                if (err) console.error("Error creating packets table:", err);
              }
            );

            // Packet tracking logs
            db.run(
              `CREATE TABLE IF NOT EXISTS tracking_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                packetId INTEGER NOT NULL,
                studentEmail TEXT NOT NULL,
                action TEXT NOT NULL,
                viewedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(packetId) REFERENCES packets(id)
              )`,
              (err) => {
                if (err) console.error("Error creating tracking_logs table:", err);
              }
            );

            // Requests table (for course requests)
            db.run(
              `CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                studentEmail TEXT NOT NULL,
                courseId INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                requestedAt TEXT DEFAULT CURRENT_TIMESTAMP,
                approvedAt TEXT,
                FOREIGN KEY(courseId) REFERENCES courses(id)
              )`,
              (err) => {
                if (err) console.error("Error creating requests table:", err);
                else {
                  console.log("All tables created successfully!");
                  seedDatabase().then(resolve).catch(reject);
                }
              }
            );
          } else {
            console.log("Database tables already exist");
            seedDatabase().then(resolve).catch(reject);
          }
        }
      );
    });
  });
}

// Seed database with initial data
export async function seedDatabase() {
  try {
    const userCount = await allAsync("SELECT COUNT(*) as count FROM users");
    
    if (userCount[0].count === 0) {
      console.log("Seeding database with sample data...");
      
      // Insert sample users
      const now = new Date().toISOString();
      const users = [
        { name: "Super Admin", email: "admin@lms.com", password: "admin123", role: "admin", section: null },
        { name: "Priya Sharma", email: "priya@lms.com", password: "faculty123", role: "faculty", section: "AI/ML" },
        { name: "Aman Singh", email: "aman@lms.com", password: "student123", role: "student", section: "AI/ML" },
        { name: "Riya Patel", email: "riya@lms.com", password: "student123", role: "student", section: "FSD" },
        { name: "Karan Verma", email: "karan@lms.com", password: "student123", role: "student", section: "DS" },
      ];

      for (const user of users) {
        await runAsync(
          `INSERT INTO users (name, email, password, role, section, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user.name, user.email, user.password, user.role, user.section, now, now]
        );
      }
      console.log("✓ Sample users created");

      // Insert sample packets (mix of approved and pending)
      const packets = [
        {
          title: "DSA Fundamentals",
          course: "Data Structures",
          description: "Complete DSA course material with examples and practice problems",
          facultyEmail: "priya@lms.com",
          submittedBy: "priya@lms.com",
          status: "approved",
          remarks: "Approved - comprehensive resource"
        },
        {
          title: "Web Development Guide",
          course: "Frontend",
          description: "Complete guide for React, Vue, and Angular frameworks",
          facultyEmail: "priya@lms.com",
          submittedBy: "priya@lms.com",
          status: "approved",
          remarks: "Approved - excellent frontend guide"
        },
        {
          title: "Python Programming Basics",
          course: "Python",
          description: "Beginner to intermediate Python programming with projects",
          facultyEmail: "priya@lms.com",
          submittedBy: "priya@lms.com",
          status: "pending",
          remarks: null
        },
        {
          title: "Database Design Patterns",
          course: "Databases",
          description: "SQL and NoSQL database design patterns",
          facultyEmail: "priya@lms.com",
          submittedBy: "priya@lms.com",
          status: "pending",
          remarks: null
        },
      ];

      for (const packet of packets) {
        await runAsync(
          `INSERT INTO packets (title, course, description, facultyEmail, submittedBy, status, remarks, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [packet.title, packet.course, packet.description, packet.facultyEmail, packet.submittedBy, packet.status, packet.remarks, now, now]
        );
      }
      console.log("✓ Sample packets created");
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already has data, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run query and return promise
export function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Get all rows
export function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

// Get single row
export function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

export function closeDb() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed");
        db = null;
      }
    });
  }
}
