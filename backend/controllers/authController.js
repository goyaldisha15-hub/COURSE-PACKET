import { createUser, validateUser } from "../models/userModel.js";

export function login(req, res) {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required." });
  }

  const user = validateUser(email, password, role);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  return res.json(user);
}

export function register(req, res) {
  const { name, email, password, role, section } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }

  if (role === "student" && !section) {
    return res.status(400).json({ message: "Student section is required." });
  }

  const user = createUser({ name, email, password, role, section });
  if (!user) {
    return res.status(400).json({ message: "Unable to register user. Email may already exist or invalid data." });
  }

  return res.status(201).json(user);
}
