import { createUser, listUsers, validateUser, findUserByEmail, updateUserProfile, changePassword, createPasswordResetToken, resetPassword, getUserNotifications, markNotificationRead, adminUpdateUser, adminDeleteUser } from "../models/userModel.js";


function getEmail(req) {
  return req.headers["x-user-email"];
}


export async function login(req, res) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: "Email, password, and role are required." });
    
    const user = await validateUser(email, password, role);
    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    res.json(user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function register(req, res) {
  try {
    const { name, email, password, role, section } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: "Name, email, password, and role are required." });
    if (role === "student" && !section) return res.status(400).json({ message: "Student section is required." });

    const user = await createUser({ name, email, password, role, section });
    if (!user) return res.status(400).json({ message: "Email already exists or invalid data." });
    res.status(201).json(user);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function getUsers(req, res) {
  try {
    res.json(await listUsers());
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function getProfile(req, res) {
  try {
    const email = getEmail(req);
    if (!email) return res.status(400).json({ message: "User email is required" });
    
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function updateProfile(req, res) {
  try {
    const email = getEmail(req);
    if (!email) return res.status(400).json({ message: "User email is required" });
    
    const user = await updateUserProfile(email, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleChangePassword(req, res) {
  try {
    const email = getEmail(req);
    const { oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) return res.status(400).json({ message: "All fields are required" });
    
    const result = await changePassword(email, oldPassword, newPassword);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleForgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const result = await createPasswordResetToken(email);
    if (!result) return res.status(404).json({ message: "Email not found" });
    res.json(result);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleResetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password are required" });
    
    const result = await resetPassword(token, newPassword);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function getNotifications(req, res) {
  try {
    const email = getEmail(req);
    if (!email) return res.status(400).json({ message: "User email is required" });
    res.json(await getUserNotifications(email));
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleMarkNotificationRead(req, res) {
  try {
    res.json(await markNotificationRead(req.params.notificationId));
  } catch (error) {
    console.error("Mark notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function adminUpdateUserById(req, res) {
  try {
    const user = await adminUpdateUser(req.params.userId, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function adminDeleteUserById(req, res) {
  try {
    const result = await adminDeleteUser(req.params.userId);
    if (!result) return res.status(404).json({ message: "User not found or cannot be deleted" });
    res.json(result);
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
