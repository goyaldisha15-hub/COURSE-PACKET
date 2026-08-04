import { allAsync, runAsync, getAsync } from "../database/database.js";


export async function recordDownload(studentEmail, packetId) {
  try {
    await runAsync(
      "INSERT INTO downloads (studentEmail, packetId) VALUES (?, ?)",
      [studentEmail, packetId]
    );
    return { success: true };
  } catch (error) {
    console.error("Error recording download:", error);
    return { success: false };
  }
}


export async function getStudentDownloads(studentEmail) {
  try {
    return allAsync(
      `SELECT d.*, p.title, p.course, p.subjectCode, p.facultyEmail, p.department, p.section, p.semester, p.packetType, p.fileName
       FROM downloads d 
       JOIN packets p ON d.packetId = p.id 
       WHERE d.studentEmail = ? 
       ORDER BY d.downloadedAt DESC`,
      [studentEmail]
    );
  } catch (error) {
    console.error("Error getting downloads:", error);
    return [];
  }
}


export async function getPacketDownloadCount(packetId) {
  try {
    const result = await getAsync(
      "SELECT COUNT(*) as count FROM downloads WHERE packetId = ?",
      [packetId]
    );
    return result?.count || 0;
  } catch (error) {
    return 0;
  }
}


export async function getFacultyTotalDownloads(facultyEmail) {
  try {
    const result = await getAsync(
      `SELECT COUNT(*) as count FROM downloads d 
       JOIN packets p ON d.packetId = p.id 
       WHERE p.facultyEmail = ?`,
      [facultyEmail]
    );
    return result?.count || 0;
  } catch (error) {
    return 0;
  }
}


export async function getRecentDownloads(studentEmail) {
  try {
    return allAsync(
      `SELECT d.*, p.title, p.course, p.department, p.section, p.semester
       FROM downloads d 
       JOIN packets p ON d.packetId = p.id 
       WHERE d.studentEmail = ? 
       ORDER BY d.downloadedAt DESC 
       LIMIT 10`,
      [studentEmail]
    );
  } catch (error) {
    console.error("Error getting recent downloads:", error);
    return [];
  }
}
