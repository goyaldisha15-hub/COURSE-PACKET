import { allAsync, getAsync, runAsync } from "../database/database.js";

export async function findCourseById(id) {
  return getAsync("SELECT * FROM courses WHERE id = ?", [id]);
}

export async function listCoursesBySection(section) {
  return allAsync("SELECT * FROM courses WHERE section = ? ORDER BY createdAt DESC", [section]);
}

export async function listCoursesForStudent(studentSection, extraSections = []) {
  const sections = [studentSection, ...new Set(extraSections)];
  const placeholders = sections.map(() => "?").join(",");
  return allAsync(
    `SELECT * FROM courses WHERE section IN (${placeholders}) ORDER BY createdAt DESC`,
    sections
  );
}

export async function listCoursesByTeacher(teacherEmail) {
  return allAsync(
    `SELECT * FROM courses WHERE (facultyId = (SELECT id FROM users WHERE email = ?)) ORDER BY createdAt DESC`,
    [teacherEmail]
  );
}

export async function createCourse({ title, description, section, teacherEmail }) {
  if (!title || !description || !section || !teacherEmail) {
    return null;
  }

  const now = new Date().toISOString();
  try {

    const faculty = await getAsync("SELECT id FROM users WHERE email = ? AND role = 'faculty'", [teacherEmail]);
    if (!faculty) {
      return null;
    }

    await runAsync(
      `INSERT INTO courses (title, code, section, facultyId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, `${section}-${Date.now()}`, section, faculty.id, now, now]
    );

    const course = await allAsync(
      "SELECT * FROM courses WHERE section = ? AND facultyId = ? ORDER BY id DESC LIMIT 1",
      [section, faculty.id]
    );
    return course[0] || null;
  } catch (error) {
    console.error("Error creating course:", error);
    return null;
  }
}

