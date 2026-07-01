import { users, sections, getNextUserId } from "./db.js";

export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

export function findUserById(id) {
  return users.find((user) => user.id === id);
}

export function listUsers() {
  return users.map(({ password, ...user }) => ({ ...user }));
}

export function listTeachers() {
  return users
    .filter((user) => user.role === "faculty")
    .map(({ password, ...user }) => ({ ...user }));
}

export function listStudents() {
  return users
    .filter((user) => user.role === "student")
    .map(({ password, ...user }) => ({ ...user }));
}

export function createUser({ name, email, password, role, section }) {
  if (findUserByEmail(email)) {
    return null;
  }

  if (!email || !password || !role) {
    return null;
  }

  if (role === "student" && !section) {
    return null;
  }

  if (role === "faculty" && section && !sections.includes(section)) {
    section = null;
  }

  const newUser = {
    id: getNextUserId(),
    name: name || email.split("@")[0],
    email,
    password,
    role,
    section: role === "student" || role === "faculty" ? section : null,
    accessSections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

export function updateUserSection(email, section) {
  const user = findUserByEmail(email);
  if (!user || !sections.includes(section)) {
    return null;
  }

  user.section = section;
  user.updatedAt = new Date().toISOString();
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function unassignTeacher(email) {
  const user = findUserByEmail(email);
  if (!user || user.role !== "faculty") {
    return null;
  }
  user.section = null;
  user.updatedAt = new Date().toISOString();
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function grantStudentSectionAccess(studentEmail, section) {
  const user = findUserByEmail(studentEmail);
  if (!user || user.role !== "student") {
    return null;
  }

  if (!sections.includes(section) || user.accessSections.includes(section)) {
    return user;
  }

  user.accessSections.push(section);
  user.updatedAt = new Date().toISOString();
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function validateUser(email, password, role) {
  const user = users.find(
    (entry) => entry.email === email && entry.password === password && entry.role === role
  );
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}
