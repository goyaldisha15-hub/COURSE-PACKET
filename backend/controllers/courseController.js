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
import {
  findUserByEmail,
  listTeachers,
  listStudents,
  updateUserSection,
  unassignTeacher as unassignTeacherModel,
} from "../models/userModel.js";

const sections = ["AI/ML", "FSD", "DS", "Cyber"];

export async function publishCourse(req, res) {
  const { title, description } = req.body;
  const teacherEmail = req.user?.email || req.headers["x-user-email"];
  const section = req.user?.section;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required." });
  }

  try {
    const course = await createCourse({ title, description, section, teacherEmail });
    if (!course) {
      return res.status(400).json({ message: "Unable to create course." });
    }
    return res.status(201).json(course);
  } catch (error) {
    console.error("Error publishing course:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getTeacherCourses(req, res) {
  try {
    const teacherEmail = req.user?.email || req.headers["x-user-email"];
    const courses = await listCoursesByTeacher(teacherEmail);
    return res.json(courses);
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getStudentCourses(req, res) {
  try {
    const studentEmail = req.headers["x-user-email"];
    const student = await findUserByEmail(studentEmail);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Student not found." });
    }

    const extraSections = student.accessSections ? JSON.parse(student.accessSections) : [];
    const courses = await listCoursesForStudent(student.section, extraSections);
    return res.json(courses);
  } catch (error) {
    console.error("Error fetching student courses:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getStudentCourseDetail(req, res) {
  try {
    const studentEmail = req.headers["x-user-email"];
    const student = await findUserByEmail(studentEmail);
    if (!student || student.role !== "student") {
      return res.status(403).json({ message: "Student not found." });
    }

    const course = await findCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const extraSections = student.accessSections ? JSON.parse(student.accessSections) : [];
    if (course.section !== student.section && !extraSections.includes(course.section)) {
      return res.status(403).json({ message: "You are not authorized to view this course." });
    }

    return res.json(course);
  } catch (error) {
    console.error("Error fetching course detail:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function requestCourseAccess(req, res) {
  try {
    const studentEmail = req.headers["x-user-email"];
    const { requestedSection, courseTitle, reason } = req.body;
    const request = await createCourseAccessRequest({ studentEmail, requestedSection, courseTitle, reason });
    if (!request) {
      return res.status(400).json({ message: "Invalid access request or same section." });
    }
    return res.status(201).json(request);
  } catch (error) {
    console.error("Error creating access request:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getStudentRequests(req, res) {
  try {
    const studentEmail = req.headers["x-user-email"];
    const requests = await listRequestsForStudent(studentEmail);
    return res.json(requests);
  } catch (error) {
    console.error("Error fetching student requests:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAdminPendingRequests(req, res) {
  try {
    const requests = await listPendingRequests();
    return res.json(requests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getTeacherSectionRequests(req, res) {
  try {
    const section = req.user?.section;
    const requests = await listRequestsForSection(section);
    return res.json(requests);
  } catch (error) {
    console.error("Error fetching section requests:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function adminUpdateRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { action } = req.body;
    const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : null;
    if (!status) {
      return res.status(400).json({ message: "Action must be approve or reject." });
    }

    const updated = await updateRequestStatus(requestId, status, req.headers["x-user-email"]);
    if (!updated) {
      return res.status(404).json({ message: "Request not found or invalid status." });
    }
    return res.json(updated);
  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function teacherEscalateRequest(req, res) {
  try {
    const { requestId } = req.params;
    const updated = await escalateRequest(requestId);
    if (!updated) {
      return res.status(404).json({ message: "Request not found or cannot be escalated." });
    }
    return res.json(updated);
  } catch (error) {
    console.error("Error escalating request:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export function listSections(req, res) {
  return res.json(sections);
}

export async function getTeachers(req, res) {
  try {
    const teachers = await listTeachers();
    return res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getStudents(req, res) {
  try {
    const students = await listStudents();
    return res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function assignTeacherSection(req, res) {
  try {
    const { teacherEmail, section } = req.body;
    const result = await updateUserSection(teacherEmail, section);
    if (!result) {
      return res.status(400).json({ message: "Unable to assign section." });
    }
    return res.json(result);
  } catch (error) {
    console.error("Error assigning section:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function unassignTeacher(req, res) {
  try {
    const { teacherEmail } = req.body;
    const result = await unassignTeacherModel(teacherEmail);
    if (!result) {
      return res.status(400).json({ message: "Unable to unassign teacher." });
    }
    return res.json(result);
  } catch (error) {
    console.error("Error unassigning teacher:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
