import { allAsync, getAsync, runAsync } from "./database.js";

export async function createPacketRequest({ title, course, description, submittedBy, facultyEmail }) {
  const now = new Date().toISOString();
  try {
    await runAsync(
      `INSERT INTO packets (title, course, description, submittedBy, facultyEmail, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [title, course, description, submittedBy, facultyEmail, now, now]
    );

    const packet = await allAsync(
      "SELECT * FROM packets WHERE facultyEmail = ? ORDER BY id DESC LIMIT 1",
      [facultyEmail]
    );
    return packet[0] || null;
  } catch (error) {
    console.error("Error creating packet request:", error);
    return null;
  }
}

export async function getPendingPacketRequests() {
  return allAsync("SELECT * FROM packets WHERE status = 'pending' ORDER BY createdAt DESC");
}

export async function getApprovedPacketRequests() {
  return allAsync("SELECT * FROM packets WHERE status = 'approved' ORDER BY createdAt DESC");
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
