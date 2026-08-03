import { authHeaders, jsonRequest } from "./apiClient";

export function getStudentCourses(role, email) {
  return jsonRequest("get", "/student/courses", null, authHeaders(role, email));
}

export function getStudentCourseById(courseId, role, email) {
  return jsonRequest("get", `/student/courses/${courseId}`, null, authHeaders(role, email));
}

export function publishCourse(title, description, email, role = "faculty") {
  return jsonRequest(
    "post",
    "/faculty/courses",
    { title, description },
    authHeaders(role, email)
  );
}

export function requestCourseAccess(requestedSection, courseTitle, reason, email, role = "student") {
  return jsonRequest(
    "post",
    "/student/courses/access-request",
    { requestedSection, courseTitle, reason },
    authHeaders(role, email)
  );
}

export function getStudentRequests(email, role = "student") {
  return jsonRequest("get", "/student/courses/requests", null, authHeaders(role, email));
}

export function trackCourse(courseId, email, role = "student") {
  return jsonRequest("post", `/student/courses/${courseId}/track`, {}, authHeaders(role, email));
}

