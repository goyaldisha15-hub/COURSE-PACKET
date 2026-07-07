import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getStudentCourses(role, email) {
  try {
    const response = await apiClient.get("/student/courses", {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student courses:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch courses", { cause: error });
  }
}

export async function getStudentCourseById(courseId, role, email) {
  try {
    const response = await apiClient.get(`/student/courses/${courseId}`, {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch course", { cause: error });
  }
}

export async function publishCourse(title, description, email, role = "faculty") {
  try {
    const response = await apiClient.post(
      "/faculty/courses",
      { title, description },
      {
        headers: {
          "x-user-email": email,
          "x-user-role": role,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to publish course", { cause: error });
  }
}

export async function requestCourseAccess(requestedSection, courseTitle, reason, email, role = "student") {
  try {
    const response = await apiClient.post(
      "/student/courses/access-request",
      { requestedSection, courseTitle, reason },
      {
        headers: {
          "x-user-email": email,
          "x-user-role": role,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to request course access", { cause: error });
  }
}

export async function getStudentRequests(email, role = "student") {
  try {
    const response = await apiClient.get("/student/courses/requests", {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student requests:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch requests", { cause: error });
  }
}

export async function trackCourse(courseId, email, role = "student") {
  try {
    const response = await apiClient.post(
      `/student/courses/${courseId}/track`,
      {},
      {
        headers: {
          "x-user-email": email,
          "x-user-role": role,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to track course", { cause: error });
  }
}
