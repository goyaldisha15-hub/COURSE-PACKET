import {
  createCourse,
  findCourseById,
  listCoursesByTeacher,
  listCoursesForStudent,
} from "../models/courseModel.js";
import {
  createCourseAccessRequest,
  listRequestsForStudent,
  listPendingRequests,
  listRequestsForSection,
  updateRequestStatus,
  escalateRequest,
} from "../models/requestModel.js";
import { sections } from "../models/db.js";
import {
  findUserByEmail,
  listTeachers,
  listStudents,
  updateUserSection,
  unassignTeacher as unassignTeacherModel,
} from "../models/userModel.js";

export function publishCourse(req, res) {
  const { title, description } = req.body;
  const teacherEmail = req.user.email;
  const section = req.user.section;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required." });
  }

  const course = createCourse({ title, description, section, teacherEmail });
  return res.status(201).json(course);
}

export function getTeacherCourses(req, res) {
  const teacherEmail = req.user.email;
  return res.json(listCoursesByTeacher(teacherEmail));
}

export function getStudentCourses(req, res) {
  const studentEmail = req.headers["x-user-email"];
  const student = findUserByEmail(studentEmail);
  if (!student || student.role !== "student") {
    return res.status(403).json({ message: "Student not found." });
  }

  const extraSections = student.accessSections || [];
  return res.json(listCoursesForStudent(student.section, extraSections));
}

export function getStudentCourseDetail(req, res) {
  const studentEmail = req.headers["x-user-email"];
  const student = findUserByEmail(studentEmail);
  if (!student || student.role !== "student") {
    return res.status(403).json({ message: "Student not found." });
  }

  const course = findCourseById(req.params.courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found." });
  }

  if (course.section !== student.section && !(student.accessSections || []).includes(course.section)) {
    return res.status(403).json({ message: "You are not authorized to view this course." });
  }

  return res.json(course);
}

export function requestCourseAccess(req, res) {
  const studentEmail = req.headers["x-user-email"];
  const { requestedSection, courseTitle, reason } = req.body;
  const request = createCourseAccessRequest({ studentEmail, requestedSection, courseTitle, reason });
  if (!request) {
    return res.status(400).json({ message: "Invalid access request or same section." });
  }
  return res.status(201).json(request);
}

export function getStudentRequests(req, res) {
  const studentEmail = req.headers["x-user-email"];
  return res.json(listRequestsForStudent(studentEmail));
}

export function getAdminPendingRequests(req, res) {
  return res.json(listPendingRequests());
}

export function getTeacherSectionRequests(req, res) {
  const teacherEmail = req.user.email;
  const section = req.user.section;
  return res.json(listRequestsForSection(section));
}

export function adminUpdateRequest(req, res) {
  const { requestId } = req.params;
  const { action } = req.body;
  const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : null;
  if (!status) {
    return res.status(400).json({ message: "Action must be approve or reject." });
  }

  const updated = updateRequestStatus(requestId, status, req.headers["x-user-email"]);
  if (!updated) {
    return res.status(404).json({ message: "Request not found or invalid status." });
  }
  return res.json(updated);
}

export function teacherEscalateRequest(req, res) {
  const { requestId } = req.params;
  const updated = escalateRequest(requestId);
  if (!updated) {
    return res.status(404).json({ message: "Request not found or cannot be escalated." });
  }
  return res.json(updated);
}

export function listSections(req, res) {
  return res.json(sections);
}

export function getTeachers(req, res) {
  return res.json(listTeachers());
}

export function getStudents(req, res) {
  return res.json(listStudents());
}

export function assignTeacherSection(req, res) {
  const { teacherEmail, section } = req.body;
  const result = updateUserSection(teacherEmail, section);
  if (!result) {
    return res.status(400).json({ message: "Unable to assign section." });
  }
  return res.json(result);
}

export function unassignTeacher(req, res) {
  const { teacherEmail } = req.body;
  const result = unassignTeacherModel(teacherEmail);
  if (!result) {
    return res.status(400).json({ message: "Unable to unassign teacher." });
  }
  return res.json(result);
}
