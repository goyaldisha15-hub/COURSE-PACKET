import { courseAccessRequests, getNextRequestId } from "./db.js";
import { findUserByEmail, grantStudentSectionAccess } from "./userModel.js";

export function createCourseAccessRequest({ studentEmail, requestedSection, courseTitle, reason }) {
  const student = findUserByEmail(studentEmail);
  if (!student || student.role !== "student") {
    return null;
  }

  if (!requestedSection || requestedSection === student.section) {
    return null;
  }

  const existing = courseAccessRequests.find(
    (request) =>
      request.studentEmail === studentEmail &&
      request.requestedSection === requestedSection &&
      request.status === "pending"
  );

  if (existing) {
    return null;
  }

  const newRequest = {
    id: getNextRequestId(),
    studentEmail,
    studentSection: student.section,
    requestedSection,
    courseTitle: courseTitle || "Any course from section",
    reason: reason || "Cross-section access needed",
    status: "pending",
    teacherEscalated: false,
    approvedByAdmin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  courseAccessRequests.push(newRequest);
  return newRequest;
}

export function listRequestsForStudent(studentEmail) {
  return courseAccessRequests.filter((request) => request.studentEmail === studentEmail);
}

export function listPendingRequests() {
  return courseAccessRequests.filter((request) => request.status === "pending");
}

export function listRequestsForSection(section) {
  return courseAccessRequests.filter(
    (request) => request.requestedSection === section && request.status === "pending"
  );
}

export function updateRequestStatus(id, status, adminEmail) {
  const request = courseAccessRequests.find((entry) => entry.id === id);
  if (!request || !["approved", "rejected"].includes(status)) {
    return null;
  }

  request.status = status;
  request.adminEmail = adminEmail;
  request.updatedAt = new Date().toISOString();

  if (status === "approved") {
    grantStudentSectionAccess(request.studentEmail, request.requestedSection);
  }

  return request;
}

export function escalateRequest(id) {
  const request = courseAccessRequests.find((entry) => entry.id === id);
  if (!request || request.status !== "pending") {
    return null;
  }
  request.teacherEscalated = true;
  request.updatedAt = new Date().toISOString();
  return request;
}
