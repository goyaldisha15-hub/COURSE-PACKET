import { createUser, listUsers, validateUser } from "../models/userModel.js";

export async function login(req, res) {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required." });
  }

  try {
    const user = await validateUser(email, password, role);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.json(user);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function register(req, res) {
  const { name, email, password, role, section } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }

  if (role === "student" && !section) {
    return res.status(400).json({ message: "Student section is required." });
  }

  try {
    const user = await createUser({ name, email, password, role, section });
    if (!user) {
      return res.status(400).json({ message: "Unable to register user. Email may already exist or invalid data." });
    }

    return res.status(201).json(user);
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await listUsers();
    return res.json(users);
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
