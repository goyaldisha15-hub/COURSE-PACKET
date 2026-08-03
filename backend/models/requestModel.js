import { allAsync, getAsync, runAsync } from "./database.js";
import { findUserByEmail } from "./userModel.js";

export async function createCourseAccessRequest({ studentEmail, requestedSection, courseTitle, reason }) {
  const student = await findUserByEmail(studentEmail);
  if (!student || student.role !== "student") {
    return null;
  }

  if (!requestedSection || requestedSection === student.section) {
    return null;
  }

  const existing = await getAsync(
    "SELECT * FROM requests WHERE studentEmail = ? AND status = 'pending' LIMIT 1",
    [studentEmail]
  );

  if (existing) {
    return null;
  }

  const now = new Date().toISOString();
  try {
    await runAsync(
      `INSERT INTO requests (studentEmail, status, requestedAt) 
       VALUES (?, 'pending', ?)`,
      [studentEmail, now]
    );

    const request = await allAsync(
      "SELECT * FROM requests WHERE studentEmail = ? ORDER BY id DESC LIMIT 1",
      [studentEmail]
    );
    return request[0] || null;
  } catch (error) {
    console.error("Error creating course access request:", error);
    return null;
  }
}

export async function listRequestsForStudent(studentEmail) {
  return allAsync("SELECT * FROM requests WHERE studentEmail = ? ORDER BY requestedAt DESC", [studentEmail]);
}

export async function listPendingRequests() {
  return allAsync("SELECT * FROM requests WHERE status = 'pending' ORDER BY requestedAt DESC");
}

export async function listRequestsForSection(section) {
  return allAsync(
    "SELECT * FROM requests WHERE status = 'pending' ORDER BY requestedAt DESC"
  );
}

export async function updateRequestStatus(id, status, adminEmail) {
  if (!["approved", "rejected"].includes(status)) {
    return null;
  }

  const now = new Date().toISOString();
  try {
    const request = await getAsync("SELECT * FROM requests WHERE id = ?", [id]);
    if (!request) {
      return null;
    }

    await runAsync(
      "UPDATE requests SET status = ?, approvedAt = ? WHERE id = ?",
      [status, status === "approved" ? now : null, id]
    );

    if (status === "approved") {
      const studentEmail = request.studentEmail;

      const student = await findUserByEmail(studentEmail);
      if (student && request.courseId) {

        const course = await getAsync("SELECT * FROM courses WHERE id = ?", [request.courseId]);
        if (course) {

        }
      }
    }

    return getAsync("SELECT * FROM requests WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error updating request status:", error);
    return null;
  }
}

export async function escalateRequest(id) {
  const request = await getAsync("SELECT * FROM requests WHERE id = ? AND status = 'pending'", [id]);
  if (!request) {
    return null;
  }

  const now = new Date().toISOString();
  await runAsync(
    "UPDATE requests SET updatedAt = ? WHERE id = ?",
    [now, id]
  );

  return getAsync("SELECT * FROM requests WHERE id = ?", [id]);
}

