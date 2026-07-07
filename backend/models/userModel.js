import { allAsync, getAsync, runAsync } from "./database.js";

export async function findUserByEmail(email) {
  return getAsync("SELECT * FROM users WHERE email = ?", [email]);
}

export async function findUserById(id) {
  return getAsync("SELECT * FROM users WHERE id = ?", [id]);
}

export async function listUsers() {
  const users = await allAsync("SELECT id, name, email, role, section, accessSections, createdAt, updatedAt FROM users");
  return users;
}

export async function listTeachers() {
  return allAsync(
    "SELECT id, name, email, role, section, accessSections, createdAt, updatedAt FROM users WHERE role = 'faculty'"
  );
}

export async function listStudents() {
  return allAsync(
    "SELECT id, name, email, role, section, accessSections, createdAt, updatedAt FROM users WHERE role = 'student'"
  );
}

export async function createUser({ name, email, password, role, section }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    return null;
  }

  if (!email || !password || !role) {
    return null;
  }

  if (role === "student" && !section) {
    return null;
  }

  const finalSection = role === "student" || role === "faculty" ? section : null;
  const now = new Date().toISOString();

  try {
    await runAsync(
      `INSERT INTO users (name, email, password, role, section, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name || email.split("@")[0], email, password, role, finalSection, now, now]
    );

    const newUser = await findUserByEmail(email);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function updateUserSection(email, section) {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  const now = new Date().toISOString();
  await runAsync(
    "UPDATE users SET section = ?, updatedAt = ? WHERE email = ?",
    [section, now, email]
  );

  const updated = await findUserByEmail(email);
  const { password: _, ...safeUser } = updated;
  return safeUser;
}

export async function unassignTeacher(email) {
  const user = await findUserByEmail(email);
  if (!user || user.role !== "faculty") {
    return null;
  }

  const now = new Date().toISOString();
  await runAsync(
    "UPDATE users SET section = NULL, updatedAt = ? WHERE email = ?",
    [now, email]
  );

  const updated = await findUserByEmail(email);
  const { password: _, ...safeUser } = updated;
  return safeUser;
}

export async function grantStudentSectionAccess(studentEmail, section) {
  const user = await findUserByEmail(studentEmail);
  if (!user || user.role !== "student") {
    return null;
  }

  const currentAccess = JSON.parse(user.accessSections || "[]");
  if (currentAccess.includes(section)) {
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  currentAccess.push(section);
  const now = new Date().toISOString();
  await runAsync(
    "UPDATE users SET accessSections = ?, updatedAt = ? WHERE email = ?",
    [JSON.stringify(currentAccess), now, studentEmail]
  );

  const updated = await findUserByEmail(studentEmail);
  const { password: _, ...safeUser } = updated;
  return safeUser;
}

export async function validateUser(email, password, role) {
  const user = await findUserByEmail(email);
  if (!user || user.password !== password || user.role !== role) {
    return null;
  }
  const { password: _, ...safeUser } = user;
  return safeUser;
}
