import { allAsync, runAsync, getAsync } from "../database/database.js";


export async function addBookmark(studentEmail, packetId) {
  try {
    await runAsync(
      "INSERT OR IGNORE INTO bookmarks (studentEmail, packetId) VALUES (?, ?)",
      [studentEmail, packetId]
    );
    return { success: true };
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return { success: false };
  }
}


export async function removeBookmark(studentEmail, packetId) {
  try {
    await runAsync(
      "DELETE FROM bookmarks WHERE studentEmail = ? AND packetId = ?",
      [studentEmail, packetId]
    );
    return { success: true };
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return { success: false };
  }
}


export async function getStudentBookmarks(studentEmail) {
  try {
    return allAsync(
      `SELECT b.*, p.title, p.course, p.subjectCode, p.facultyEmail, p.department, p.section, p.semester, p.packetType, p.fileName, p.filePath, p.downloadCount
       FROM bookmarks b 
       JOIN packets p ON b.packetId = p.id 
       WHERE b.studentEmail = ? 
       ORDER BY b.createdAt DESC`,
      [studentEmail]
    );
  } catch (error) {
    console.error("Error getting bookmarks:", error);
    return [];
  }
}


export async function isBookmarked(studentEmail, packetId) {
  try {
    const result = await getAsync(
      "SELECT id FROM bookmarks WHERE studentEmail = ? AND packetId = ?",
      [studentEmail, packetId]
    );
    return !!result;
  } catch (error) {
    return false;
  }
}
