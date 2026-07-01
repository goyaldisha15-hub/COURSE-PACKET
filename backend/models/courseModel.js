import { courses, getNextCourseId } from "./db.js";

export function findCourseById(id) {
  return courses.find((course) => course.id === id);
}

export function listCoursesBySection(section) {
  return courses.filter((course) => course.section === section);
}

export function listCoursesForStudent(studentSection, extraSections = []) {
  const allowedSections = [studentSection, ...new Set(extraSections)];
  return courses.filter((course) => allowedSections.includes(course.section));
}

export function listCoursesByTeacher(teacherEmail) {
  return courses.filter((course) => course.teacherEmail === teacherEmail);
}

export function createCourse({ title, description, section, teacherEmail }) {
  if (!title || !description || !section || !teacherEmail) {
    return null;
  }

  const newCourse = {
    id: getNextCourseId(),
    title,
    description,
    section,
    teacherEmail,
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  courses.push(newCourse);
  return newCourse;
}
