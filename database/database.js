import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

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
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, tables) => {
          if (err) {
            reject(err);
            return;
          }

          if (tables.length === 0) {
            console.log("Creating database tables...");
            createAllTables(db).then(resolve).catch(reject);
          } else {
            console.log("Database tables already exist, checking for updates...");
            addNewColumns(db).then(resolve).catch(reject);
          }
        }
      );
    });
  });
}


async function addNewColumns(db) {
  try {

    const columns = await allAsync("PRAGMA table_info(users)");
    const columnNames = columns.map(c => c.name);
    
    if (!columnNames.includes("department")) {
      console.log("Adding new profile columns to users table...");
      await runAsync("ALTER TABLE users ADD COLUMN department TEXT DEFAULT ''");
      await runAsync("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''");
      await runAsync("ALTER TABLE users ADD COLUMN registrationNo TEXT DEFAULT ''");
      await runAsync("ALTER TABLE users ADD COLUMN aboutMe TEXT DEFAULT ''");
      await runAsync("ALTER TABLE users ADD COLUMN profilePhoto TEXT DEFAULT ''");
    }


    const packetColumns = await allAsync("PRAGMA table_info(packets)");
    const packetColumnNames = packetColumns.map(c => c.name);
    
    if (!packetColumnNames.includes("subjectCode")) {
      console.log("Adding new columns to packets table...");
      await runAsync("ALTER TABLE packets ADD COLUMN subjectCode TEXT DEFAULT ''");
      await runAsync("ALTER TABLE packets ADD COLUMN semester TEXT DEFAULT ''");
      await runAsync("ALTER TABLE packets ADD COLUMN department TEXT DEFAULT ''");
      await runAsync("ALTER TABLE packets ADD COLUMN section TEXT DEFAULT ''");
      await runAsync("ALTER TABLE packets ADD COLUMN academicYear TEXT DEFAULT ''");
      await runAsync("ALTER TABLE packets ADD COLUMN packetType TEXT DEFAULT 'notes'");
      await runAsync("ALTER TABLE packets ADD COLUMN fileName TEXT DEFAULT ''");
      await runAsync("ALTER TABLE packets ADD COLUMN filePath TEXT DEFAULT ''");
      await runAsync("ALTER TABLE packets ADD COLUMN fileSize INTEGER DEFAULT 0");
      await runAsync("ALTER TABLE packets ADD COLUMN downloadCount INTEGER DEFAULT 0");
    }


    await createNewTables();

    console.log("Database columns check complete");
    await seedDatabase();
  } catch (error) {
    console.error("Error updating database schema:", error);
    throw error;
  }
}


async function createNewTables() {

  const deptTables = await allAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='departments'");
  if (deptTables.length === 0) {
    console.log("Creating departments table...");
    await runAsync(
      `CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        code TEXT UNIQUE NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✓ Departments table created");
  }


  const subjTables = await allAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='subjects'");
  if (subjTables.length === 0) {
    console.log("Creating subjects table...");
    await runAsync(
      `CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        semester TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );
    console.log("✓ Subjects table created");
  }


  const bmTables = await allAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks'");
  if (bmTables.length === 0) {
    console.log("Creating bookmarks table...");
    await runAsync(
      `CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentEmail TEXT NOT NULL,
        packetId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(packetId) REFERENCES packets(id),
        UNIQUE(studentEmail, packetId)
      )`
    );
    console.log("✓ Bookmarks table created");
  }


  const dlTables = await allAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='downloads'");
  if (dlTables.length === 0) {
    console.log("Creating downloads table...");
    await runAsync(
      `CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentEmail TEXT NOT NULL,
        packetId INTEGER NOT NULL,
        downloadedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(packetId) REFERENCES packets(id)
      )`
    );
    console.log("✓ Downloads table created");
  }


  const ahTables = await allAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='approval_history'");
  if (ahTables.length === 0) {
    console.log("Creating approval_history table...");
    await runAsync(
      `CREATE TABLE IF NOT EXISTS approval_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        packetId INTEGER NOT NULL,
        action TEXT NOT NULL,
        remarks TEXT DEFAULT '',
        performedBy TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(packetId) REFERENCES packets(id)
      )`
    );
    console.log("✓ Approval history table created");
  }
}

function createAllTables(db) {
  return new Promise((resolve, reject) => {

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'faculty', 'student')),
        section TEXT,
        department TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        registrationNo TEXT DEFAULT '',
        aboutMe TEXT DEFAULT '',
        profilePhoto TEXT DEFAULT '',
        accessSections TEXT DEFAULT '[]',
        semester TEXT DEFAULT '',
        employeeId TEXT DEFAULT '',
        skills TEXT DEFAULT '',
        lastLogin TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) { console.error("Error creating users table:", err); reject(err); return; }
        createCoursesTable(db).then(resolve).catch(reject);
      }
    );
  });
}

function createCoursesTable(db) {
  return new Promise((resolve, reject) => {
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
        if (err) { console.error("Error creating courses table:", err); reject(err); return; }
        createPacketsTable(db).then(resolve).catch(reject);
      }
    );
  });
}

function createPacketsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS packets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        course TEXT NOT NULL,
        subjectCode TEXT DEFAULT '',
        description TEXT,
        facultyEmail TEXT NOT NULL,
        submittedBy TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'returned')),
        remarks TEXT,
        semester TEXT DEFAULT '',
        department TEXT DEFAULT '',
        section TEXT DEFAULT '',
        academicYear TEXT DEFAULT '',
        packetType TEXT DEFAULT 'notes',
        fileName TEXT DEFAULT '',
        filePath TEXT DEFAULT '',
        fileSize INTEGER DEFAULT 0,
        downloadCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) { console.error("Error creating packets table:", err); reject(err); return; }
        createTrackingLogsTable(db).then(resolve).catch(reject);
      }
    );
  });
}

function createTrackingLogsTable(db) {
  return new Promise((resolve, reject) => {
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
        if (err) { console.error("Error creating tracking_logs table:", err); reject(err); return; }
        createRequestsTable(db).then(resolve).catch(reject);
      }
    );
  });
}

function createRequestsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentEmail TEXT NOT NULL,
        courseTitle TEXT DEFAULT '',
        requestedSection TEXT DEFAULT '',
        reason TEXT DEFAULT '',
        requestedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        approvedAt TEXT
      )`,
      (err) => {
        if (err) { console.error("Error creating requests table:", err); reject(err); return; }
        createNotificationsTable(db).then(resolve).catch(reject);
      }
    );
  });
}

function createNotificationsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userEmail TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'info',
        isRead INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) { console.error("Error creating notifications table:", err); reject(err); return; }
        createPasswordResetsTable(db).then(resolve).catch(reject);
      }
    );
  });
}

function createPasswordResetsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) { console.error("Error creating password_resets table:", err); reject(err); return; }

        createNewTablesAfter(db).then(resolve).catch(reject);
      }
    );
  });
}

async function createNewTablesAfter(db) {
  try {
    await runAsync(
      `CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        code TEXT UNIQUE NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );
    await runAsync(
      `CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        semester TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );
    await runAsync(
      `CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentEmail TEXT NOT NULL,
        packetId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(packetId) REFERENCES packets(id),
        UNIQUE(studentEmail, packetId)
      )`
    );
    await runAsync(
      `CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentEmail TEXT NOT NULL,
        packetId INTEGER NOT NULL,
        downloadedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(packetId) REFERENCES packets(id)
      )`
    );
    await runAsync(
      `CREATE TABLE IF NOT EXISTS approval_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        packetId INTEGER NOT NULL,
        action TEXT NOT NULL,
        remarks TEXT DEFAULT '',
        performedBy TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(packetId) REFERENCES packets(id)
      )`
    );
    console.log("All tables created successfully!");
    seedDatabase().then(() => {
      console.log("Database initialization complete");
    }).catch(console.error);
  } catch (error) {
    console.error("Error creating new tables:", error);
    throw error;
  }
}


export async function seedDatabase() {
  try {

    const deptCount = await allAsync("SELECT COUNT(*) as count FROM departments");
    if (deptCount[0].count === 0) {
      console.log("Seeding departments...");
      const departments = [
        { name: "Computer Science & Engineering", code: "CSE" },
        { name: "Artificial Intelligence & Machine Learning", code: "AI-ML" },
        { name: "Artificial Intelligence & Data Science", code: "AI-DS" },
        { name: "Cyber Security", code: "CS" },
        { name: "Information Technology", code: "IT" },
        { name: "Electronics & Communication Engineering", code: "ECE" },
      ];
      for (const dept of departments) {
        await runAsync("INSERT INTO departments (name, code) VALUES (?, ?)", [dept.name, dept.code]);
      }
      console.log("✓ Departments seeded");
    }


    const subjCount = await allAsync("SELECT COUNT(*) as count FROM subjects");
    if (subjCount[0].count === 0) {
      console.log("Seeding subjects...");
      const subjects = [
        { name: "Machine Learning", code: "AIML301", department: "AI-ML", semester: "5" },
        { name: "Deep Learning", code: "AIML401", department: "AI-ML", semester: "7" },
        { name: "Data Structures", code: "CSE201", department: "CSE", semester: "3" },
        { name: "Algorithms", code: "CSE202", department: "CSE", semester: "4" },
        { name: "Database Management Systems", code: "CSE301", department: "CSE", semester: "5" },
        { name: "Computer Networks", code: "CSE302", department: "CSE", semester: "5" },
        { name: "Operating Systems", code: "CSE303", department: "CSE", semester: "5" },
        { name: "Web Development", code: "IT301", department: "IT", semester: "5" },
        { name: "Cyber Security Fundamentals", code: "CS201", department: "CS", semester: "3" },
        { name: "Network Security", code: "CS301", department: "CS", semester: "5" },
        { name: "Data Science", code: "AIDS301", department: "AI-DS", semester: "5" },
        { name: "Digital Electronics", code: "ECE201", department: "ECE", semester: "3" },
      ];
      for (const subj of subjects) {
        await runAsync(
          "INSERT INTO subjects (name, code, department, semester) VALUES (?, ?, ?, ?)",
          [subj.name, subj.code, subj.department, subj.semester]
        );
      }
      console.log("✓ Subjects seeded");
    }


    const userCount = await allAsync("SELECT COUNT(*) as count FROM users");
    const defaultUsers = [
      { name: "College Admin", email: "admin@college.com", passwordText: "admin123", role: "admin", section: '', department: "Administration", semester: "", employeeId: "ADM001", registrationNo: "" },
      { name: "Professor Arjun Mehta", email: "faculty@college.com", passwordText: "faculty123", role: "faculty", section: "AI/ML", department: "AI-ML", semester: "", employeeId: "FAC001", registrationNo: "" },
      { name: "Student Aisha Khan", email: "student@college.com", passwordText: "student123", role: "student", section: "AI/ML", department: "AI-ML", semester: "5", registrationNo: "2024AIML001", employeeId: "" },
    ];

    const salt = await bcrypt.genSalt(10);
    const now = new Date().toISOString();

    for (const user of defaultUsers) {
      const existing = await getAsync("SELECT * FROM users WHERE email = ?", [user.email]);
      if (existing) {
        const updates = [];
        const params = [];
        if (existing.name !== user.name) {
          updates.push("name = ?");
          params.push(user.name);
        }
        if (existing.role !== user.role) {
          updates.push("role = ?");
          params.push(user.role);
        }
        if ((existing.section || "") !== (user.section || "")) {
          updates.push("section = ?");
          params.push(user.section || "");
        }
        if ((existing.department || "") !== (user.department || "")) {
          updates.push("department = ?");
          params.push(user.department || "");
        }
        if ((existing.semester || "") !== (user.semester || "")) {
          updates.push("semester = ?");
          params.push(user.semester || "");
        }
        if ((existing.employeeId || "") !== (user.employeeId || "")) {
          updates.push("employeeId = ?");
          params.push(user.employeeId || "");
        }
        if ((existing.registrationNo || "") !== (user.registrationNo || "")) {
          updates.push("registrationNo = ?");
          params.push(user.registrationNo || "");
        }
        if (updates.length > 0) {
          updates.push("updatedAt = ?");
          params.push(now);
          params.push(user.email);
          await runAsync(`UPDATE users SET ${updates.join(", ")} WHERE email = ?`, params);
          console.log(`✓ Updated default user: ${user.email}`);
        }
      } else {
        const hashedPassword = await bcrypt.hash(user.passwordText, salt);
        await runAsync(
          `INSERT INTO users (name, email, password, role, section, department, semester, registrationNo, employeeId, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.name, user.email, hashedPassword, user.role, user.section || '', user.department || '', user.semester || '', user.registrationNo || '', user.employeeId || '', now, now]
        );
        console.log(`✓ Default user created: ${user.email}`);
      }
    }


    const faculty = await getAsync("SELECT id FROM users WHERE email = ? AND role = 'faculty'", ["faculty@college.com"]);
    if (faculty) {
      const courseTitles = [
        { title: "Machine Learning with Python", code: "AI-ML-101", section: "AI/ML" },
        { title: "Applied Data Science", code: "AI-ML-102", section: "AI/ML" },
      ];
      for (const course of courseTitles) {
        const existingCourse = await getAsync("SELECT id FROM courses WHERE title = ? AND facultyId = ?", [course.title, faculty.id]);
        if (!existingCourse) {
          await runAsync(
            `INSERT INTO courses (title, code, section, facultyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [course.title, course.code, course.section, faculty.id, now, now]
          );
          console.log(`✓ Default course created: ${course.title}`);
        }
      }
    }


    const packets = [
      {
        title: "Machine Learning Lecture Notes",
        course: "Machine Learning with Python",
        subjectCode: "AIML301",
        description: "Comprehensive lecture notes covering regression, classification, and clustering.",
        facultyEmail: "faculty@college.com",
        submittedBy: "faculty@college.com",
        status: "approved",
        remarks: "Good content for semester 5.",
        semester: "5",
        department: "AI-ML",
        section: "AI/ML",
        academicYear: "2024-2025",
        packetType: "notes",
        downloadCount: 12,
      },
      {
        title: "Data Science Project Guide",
        course: "Applied Data Science",
        subjectCode: "AIML302",
        description: "Project handbook with templates, datasets, and guidance for student projects.",
        facultyEmail: "faculty@college.com",
        submittedBy: "faculty@college.com",
        status: "pending",
        remarks: "Pending admin review.",
        semester: "5",
        department: "AI-ML",
        section: "AI/ML",
        academicYear: "2024-2025",
        packetType: "guide",
        downloadCount: 0,
      },
    ];

    for (const packet of packets) {
      const existingPacket = await getAsync("SELECT id FROM packets WHERE title = ? AND facultyEmail = ?", [packet.title, packet.facultyEmail]);
      if (!existingPacket) {
        await runAsync(
          `INSERT INTO packets (title, course, subjectCode, description, facultyEmail, submittedBy, status, remarks, semester, department, section, academicYear, packetType, downloadCount, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [packet.title, packet.course, packet.subjectCode, packet.description, packet.facultyEmail, packet.submittedBy, packet.status, packet.remarks, packet.semester, packet.department, packet.section, packet.academicYear, packet.packetType, packet.downloadCount, now, now]
        );
        console.log(`✓ Default packet created: ${packet.title}`);
      }
    }


    const notificationSamples = [
      { email: "faculty@college.com", title: "Packet Submitted", message: "Your 'Machine Learning Lecture Notes' packet has been approved.", type: "success" },
      { email: "student@college.com", title: "New AI/ML Course Available", message: "A new course 'Applied Data Science' has been added for your section.", type: "info" },
    ];

    for (const note of notificationSamples) {
      const existingNote = await getAsync("SELECT id FROM notifications WHERE userEmail = ? AND title = ?", [note.email, note.title]);
      if (!existingNote) {
        await runAsync(
          `INSERT INTO notifications (userEmail, title, message, type, createdAt) VALUES (?, ?, ?, ?, ?)`,
          [note.email, note.title, note.message, note.type, now]
        );
        console.log(`✓ Default notification created for ${note.email}`);
      }
    }

    if (userCount[0].count === 0) {
      console.log("Seeding database with sample data...");
      const hashedAdminPwd = await bcrypt.hash("admin123", salt);
      const hashedFacultyPwd = await bcrypt.hash("faculty123", salt);
      const hashedStudentPwd = await bcrypt.hash("student123", salt);

      const users = [
        { name: "Super Admin", email: "admin@lms.com", password: hashedAdminPwd, role: "admin", section: null, department: "Administration", semester: "", employeeId: "ADM001" },
        { name: "Priya Sharma", email: "priya@lms.com", password: hashedFacultyPwd, role: "faculty", section: "A", department: "AI-ML", semester: "", employeeId: "FAC001" },
        { name: "Aman Singh", email: "aman@lms.com", password: hashedStudentPwd, role: "student", section: "A", department: "AI-ML", semester: "5", registrationNo: "2021AIML001" },
        { name: "Riya Patel", email: "riya@lms.com", password: hashedStudentPwd, role: "student", section: "B", department: "IT", semester: "5", registrationNo: "2021IT001" },
        { name: "Karan Verma", email: "karan@lms.com", password: hashedStudentPwd, role: "student", section: "A", department: "CSE", semester: "3", registrationNo: "2022CSE001" },
        { name: "Neha Gupta", email: "neha@lms.com", password: hashedStudentPwd, role: "student", section: "A", department: "AI-ML", semester: "5", registrationNo: "2021AIML002" },
        { name: "Rahul Kumar", email: "rahul@lms.com", password: hashedStudentPwd, role: "student", section: "C", department: "CS", semester: "5", registrationNo: "2021CS001" },
      ];

      for (const user of users) {
        await runAsync(
          `INSERT INTO users (name, email, password, role, section, department, semester, registrationNo, employeeId, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.name, user.email, user.password, user.role, user.section, user.department, user.semester, user.registrationNo || '', user.employeeId || '', now, now]
        );
      }
      console.log("✓ Sample users created");


      const packets = [
        {
          title: "Machine Learning Fundamentals",
          course: "Machine Learning",
          subjectCode: "AIML301",
          description: "Complete ML course material with algorithms, examples and practice problems",
          facultyEmail: "priya@lms.com",
          submittedBy: "priya@lms.com",
          status: "approved",
          remarks: "Approved - comprehensive resource",
          semester: "5",
          department: "AI-ML",
          section: "A",
          academicYear: "2024-2025",
          packetType: "notes",
          downloadCount: 15
        },
        {
          title: "Python for Data Science",
          course: "Data Science",
          subjectCode: "AIDS301",
          description: "Python programming guide for data science applications",
          facultyEmail: "priya@lms.com",
          submittedBy: "priya@lms.com",
          status: "approved",
          remarks: "Approved - excellent resource",
          semester: "5",
          department: "AI-DS",
          section: "A",
          academicYear: "2024-2025",
          packetType: "lab-manual",
          downloadCount: 10
        },
        {
          title: "DSA Practice Problems",
          course: "Data Structures",
          subjectCode: "CSE201",
          description: "Practice problems for Data Structures and Algorithms",
          facultyEmail: "priya@lms.com",
          submittedBy: "priya@lms.com",
          status: "pending",
          remarks: null,
          semester: "3",
          department: "CSE",
          section: "A",
          academicYear: "2024-2025",
          packetType: "assignment",
          downloadCount: 0
        },
        {
          title: "Network Security Lab Manual",
          course: "Network Security",
          subjectCode: "CS301",
          description: "Lab manual for network security experiments",
          facultyEmail: "priya@lms.com",
          submittedBy: "priya@lms.com",
          status: "pending",
          remarks: null,
          semester: "5",
          department: "CS",
          section: "C",
          academicYear: "2024-2025",
          packetType: "lab-manual",
          downloadCount: 0
        },
      ];

      for (const packet of packets) {
        await runAsync(
          `INSERT INTO packets (title, course, subjectCode, description, facultyEmail, submittedBy, status, remarks, semester, department, section, academicYear, packetType, downloadCount, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [packet.title, packet.course, packet.subjectCode, packet.description, packet.facultyEmail, packet.submittedBy, packet.status, packet.remarks, packet.semester, packet.department, packet.section, packet.academicYear, packet.packetType, packet.downloadCount, now, now]
        );
      }
      console.log("✓ Sample packets created");
      

      const faculty = await allAsync("SELECT email FROM users WHERE role = 'faculty' LIMIT 1");
      const students = await allAsync("SELECT email FROM users WHERE role = 'student' LIMIT 2");
      
      const notifications = [];
      if (faculty.length > 0) {
        notifications.push({
          userEmail: faculty[0].email,
          title: "Welcome to PacketTrack",
          message: "Your faculty account has been created. Start submitting course packets!",
          type: "info"
        });
        notifications.push({
          userEmail: faculty[0].email,
          title: "Packet Approved",
          message: "Your 'Machine Learning Fundamentals' packet has been approved by admin.",
          type: "success"
        });
      }
      if (students.length > 0) {
        notifications.push({
          userEmail: students[0].email,
          title: "Welcome to PacketTrack",
          message: "Your student account has been created. Browse approved packets now!",
          type: "info"
        });
        notifications.push({
          userEmail: students[0].email,
          title: "New Packet Available",
          message: "Machine Learning Fundamentals is now available for your department.",
          type: "info"
        });
      }
      
      for (const notif of notifications) {
        await runAsync(
          `INSERT INTO notifications (userEmail, title, message, type, createdAt) VALUES (?, ?, ?, ?, ?)`,
          [notif.userEmail, notif.title, notif.message, notif.type, now]
        );
      }
      console.log("✓ Sample notifications created");
      
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already has data, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}


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
