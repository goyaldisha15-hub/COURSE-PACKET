import { allAsync, getAsync, runAsync } from "./database.js";
import bcrypt from "bcrypt";


export async function createUser({ name, email, password, role, section, department, semester, registrationNo, employeeId }) {
  try {
    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const result = await runAsync(
      `INSERT INTO users (name, email, password, role, section, department, semester, registrationNo, employeeId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hash, role, section || '', department || '', semester || '', registrationNo || '', employeeId || '', now, now]
    );
    return getAsync("SELECT id, name, email, role, section, department, semester FROM users WHERE id = ?", [result.id]);
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}


export async function validateUser(email, password, role) {
  try {
    const user = await getAsync("SELECT * FROM users WHERE email = ? AND role = ?", [email, role]);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;


    await runAsync("UPDATE users SET lastLogin = ? WHERE id = ?", [new Date().toISOString(), user.id]);

    const { password: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error("Error validating user:", error);
    return null;
  }
}


export async function listUsers() {
  try {
    const users = await allAsync("SELECT id, name, email, role, section, department, semester, phone, registrationNo, employeeId, aboutMe, skills, profilePhoto, lastLogin, createdAt FROM users ORDER BY createdAt DESC");
    return users;
  } catch (error) {
    console.error("Error listing users:", error);
    return [];
  }
}


export async function findUserByEmail(email) {
  try {
    const user = await getAsync("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}


export async function updateUserProfile(email, data) {
  try {
    const now = new Date().toISOString();
    await runAsync(
      `UPDATE users SET name = ?, department = ?, phone = ?, registrationNo = ?, aboutMe = ?, section = ?, semester = ?, skills = ?, updatedAt = ? WHERE email = ?`,
      [data.name, data.department, data.phone, data.registrationNo, data.aboutMe, data.section, data.semester || '', data.skills || '', now, email]
    );
    return findUserByEmail(email);
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}


export async function updateProfilePhoto(email, photoPath) {
  try {
    await runAsync("UPDATE users SET profilePhoto = ?, updatedAt = ? WHERE email = ?", [photoPath, new Date().toISOString(), email]);
    return findUserByEmail(email);
  } catch (error) {
    console.error("Error updating profile photo:", error);
    return null;
  }
}


export async function changePassword(email, oldPassword, newPassword) {
  try {
    const user = await getAsync("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return { success: false, message: "User not found" };

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return { success: false, message: "Current password is incorrect" };

    const hash = await bcrypt.hash(newPassword, 10);
    await runAsync("UPDATE users SET password = ?, updatedAt = ? WHERE email = ?", [hash, new Date().toISOString(), email]);
    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Error changing password" };
  }
}


export async function createPasswordResetToken(email) {
  try {
    const user = await getAsync("SELECT id FROM users WHERE email = ?", [email]);
    if (!user) return null;

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await runAsync(
      "INSERT INTO password_resets (email, token, expiresAt) VALUES (?, ?, ?)",
      [email, token, expiresAt]
    );

    return { success: true, message: "Reset token generated", token };
  } catch (error) {
    console.error("Error creating reset token:", error);
    return null;
  }
}


export async function resetPassword(token, newPassword) {
  try {
    const reset = await getAsync(
      "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expiresAt > ?",
      [token, new Date().toISOString()]
    );
    if (!reset) return { success: false, message: "Invalid or expired token" };

    const hash = await bcrypt.hash(newPassword, 10);
    await runAsync("UPDATE users SET password = ?, updatedAt = ? WHERE email = ?", [hash, new Date().toISOString(), reset.email]);
    await runAsync("UPDATE password_resets SET used = 1 WHERE id = ?", [reset.id]);

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, message: "Error resetting password" };
  }
}


export async function getUserNotifications(email) {
  try {
    return allAsync("SELECT * FROM notifications WHERE userEmail = ? ORDER BY createdAt DESC LIMIT 50", [email]);
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
}


export async function getUnreadNotificationCount(email) {
  try {
    const result = await getAsync("SELECT COUNT(*) as count FROM notifications WHERE userEmail = ? AND isRead = 0", [email]);
    return result?.count || 0;
  } catch (error) {
    return 0;
  }
}


export async function markNotificationRead(notificationId) {
  try {
    await runAsync("UPDATE notifications SET isRead = 1 WHERE id = ?", [notificationId]);
    return { success: true };
  } catch (error) {
    console.error("Error marking notification:", error);
    return { success: false };
  }
}


export async function createNotification(userEmail, title, message, type = "info") {
  try {
    await runAsync(
      "INSERT INTO notifications (userEmail, title, message, type) VALUES (?, ?, ?, ?)",
      [userEmail, title, message, type]
    );
    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false };
  }
}


export async function adminUpdateUser(userId, data) {
  try {
    const now = new Date().toISOString();
    await runAsync(
      `UPDATE users SET name = ?, email = ?, role = ?, section = ?, department = ?, semester = ?, phone = ?, registrationNo = ?, employeeId = ?, updatedAt = ? WHERE id = ?`,
      [data.name, data.email, data.role, data.section, data.department, data.semester, data.phone, data.registrationNo, data.employeeId, now, userId]
    );
    return getAsync("SELECT id, name, email, role, section, department, semester FROM users WHERE id = ?", [userId]);
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}


export async function adminDeleteUser(userId) {
  try {
    await runAsync("DELETE FROM users WHERE id = ?", [userId]);
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
}


export async function listTeachers() {
  try {
    return allAsync("SELECT id, name, email, section, department FROM users WHERE role = 'faculty' ORDER BY name ASC");
  } catch (error) {
    console.error("Error listing teachers:", error);
    return [];
  }
}


export async function listStudents() {
  try {
    return allAsync("SELECT id, name, email, section, department, semester FROM users WHERE role = 'student' ORDER BY name ASC");
  } catch (error) {
    console.error("Error listing students:", error);
    return [];
  }
}


export async function updateUserSection(email, section) {
  try {
    await runAsync("UPDATE users SET section = ?, updatedAt = ? WHERE email = ?", [section, new Date().toISOString(), email]);
    return findUserByEmail(email);
  } catch (error) {
    console.error("Error updating user section:", error);
    return null;
  }
}


export async function unassignTeacher(email) {
  try {
    await runAsync("UPDATE users SET section = NULL, updatedAt = ? WHERE email = ?", [new Date().toISOString(), email]);
    return { success: true };
  } catch (error) {
    console.error("Error unassigning teacher:", error);
    return null;
  }
}

