import { allAsync, getAsync, runAsync } from "../database/database.js";


export async function createPacketRequest({ title, course, subjectCode, description, submittedBy, facultyEmail, semester, department, section, academicYear, packetType, fileName, filePath, fileSize }) {
  const now = new Date().toISOString();
  try {
    const result = await runAsync(
      `INSERT INTO packets (title, course, subjectCode, description, submittedBy, facultyEmail, status, semester, department, section, academicYear, packetType, fileName, filePath, fileSize, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, course, subjectCode, description, submittedBy, facultyEmail, semester, department, section, academicYear, packetType, fileName, filePath, fileSize, now, now]
    );

    const packet = await getAsync("SELECT * FROM packets WHERE id = ?", [result.id]);
    return packet;
  } catch (error) {
    console.error("Error creating packet request:", error);
    return null;
  }
}


export async function getPendingPacketRequests() {
  return allAsync("SELECT * FROM packets WHERE status = 'pending' ORDER BY createdAt DESC");
}


export async function getApprovedPacketRequests(studentDept, studentSection, studentSemester) {
  let sql = "SELECT * FROM packets WHERE status = 'approved'";
  let params = [];
  
  if (studentDept) {
    sql += " AND department = ?";
    params.push(studentDept);
  }
  if (studentSection) {
    sql += " AND section = ?";
    params.push(studentSection);
  }
  if (studentSemester) {
    sql += " AND semester = ?";
    params.push(studentSemester);
  }
  
  sql += " ORDER BY createdAt DESC";
  return allAsync(sql, params);
}


export async function getRejectedPacketRequests() {
  return allAsync("SELECT * FROM packets WHERE status = 'rejected' ORDER BY createdAt DESC");
}


export async function getPacketRequestById(id) {
  return getAsync("SELECT * FROM packets WHERE id = ?", [id]);
}


export async function updatePacketStatus(id, status, remarks = null) {
  const now = new Date().toISOString();
  try {
    await runAsync(
      "UPDATE packets SET status = ?, remarks = ?, updatedAt = ? WHERE id = ?",
      [status, remarks, now, id]
    );
    return getAsync("SELECT * FROM packets WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error updating packet status:", error);
    return null;
  }
}


export async function getFacultyPacketRequests(facultyEmail) {
  return allAsync("SELECT * FROM packets WHERE facultyEmail = ? ORDER BY createdAt DESC", [facultyEmail]);
}


export async function getAllPackets() {
  return allAsync("SELECT * FROM packets ORDER BY createdAt DESC");
}


export async function updatePacketDetails(id, { title, course, subjectCode, description, semester, department, section, academicYear, packetType }) {
  const now = new Date().toISOString();
  try {
    await runAsync(
      `UPDATE packets SET title = ?, course = ?, subjectCode = ?, description = ?, semester = ?, department = ?, section = ?, academicYear = ?, packetType = ?, updatedAt = ? WHERE id = ?`,
      [title, course, subjectCode, description, semester, department, section, academicYear, packetType, now, id]
    );
    return getAsync("SELECT * FROM packets WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error updating packet details:", error);
    return null;
  }
}


export async function deletePacketById(id) {
  try {

    await runAsync("DELETE FROM bookmarks WHERE packetId = ?", [id]);
    await runAsync("DELETE FROM downloads WHERE packetId = ?", [id]);
    await runAsync("DELETE FROM approval_history WHERE packetId = ?", [id]);
    await runAsync("DELETE FROM packets WHERE id = ?", [id]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting packet:", error);
    return null;
  }
}


export async function incrementDownloadCount(packetId) {
  try {
    await runAsync("UPDATE packets SET downloadCount = downloadCount + 1 WHERE id = ?", [packetId]);
    return true;
  } catch (error) {
    console.error("Error incrementing download count:", error);
    return false;
  }
}


export async function searchPackets(searchTerm, department, section, semester) {
  let sql = "SELECT * FROM packets WHERE status = 'approved'";
  let params = [];
  
  if (searchTerm) {
    sql += " AND (title LIKE ? OR course LIKE ? OR subjectCode LIKE ? OR facultyEmail LIKE ? OR department LIKE ?)";
    const term = `%${searchTerm}%`;
    params.push(term, term, term, term, term);
  }
  if (department) {
    sql += " AND department = ?";
    params.push(department);
  }
  if (section) {
    sql += " AND section = ?";
    params.push(section);
  }
  if (semester) {
    sql += " AND semester = ?";
    params.push(semester);
  }
  
  sql += " ORDER BY createdAt DESC";
  return allAsync(sql, params);
}


export async function getPacketsByDepartment() {
  return allAsync("SELECT department, COUNT(*) as count FROM packets GROUP BY department ORDER BY count DESC");
}


export async function getPacketsBySection() {
  return allAsync("SELECT section, COUNT(*) as count FROM packets GROUP BY section ORDER BY count DESC");
}


export async function getPacketsBySemester() {
  return allAsync("SELECT semester, COUNT(*) as count FROM packets GROUP BY semester ORDER BY semester");
}


export async function getPacketsByType() {
  return allAsync("SELECT packetType, COUNT(*) as count FROM packets GROUP BY packetType ORDER BY count DESC");
}


export async function getMonthlyStats() {
  return allAsync(`
    SELECT strftime('%Y-%m', createdAt) as month, 
           COUNT(*) as total,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
           SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
           SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM packets 
    GROUP BY month 
    ORDER BY month DESC 
    LIMIT 12
  `);
}


export async function getMostDownloadedPackets(limit = 5) {
  return allAsync("SELECT * FROM packets WHERE status = 'approved' ORDER BY downloadCount DESC LIMIT ?", [limit]);
}


export async function getLeastDownloadedPackets(limit = 5) {
  return allAsync("SELECT * FROM packets WHERE status = 'approved' ORDER BY downloadCount ASC LIMIT ?", [limit]);
}
