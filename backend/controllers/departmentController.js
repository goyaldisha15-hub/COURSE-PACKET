import { allAsync, runAsync } from "../../database/database.js";


function sendError(res, msg, status = 500) {
  console.error(msg);
  res.status(status).json({ message: msg });
}


export async function getDepartments(req, res) {
  try { res.json(await allAsync("SELECT * FROM departments ORDER BY name ASC")); }
  catch (e) { sendError(res, "Error getting departments"); }
}


export async function createDepartment(req, res) {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: "Name and code are required" });
    const result = await runAsync("INSERT INTO departments (name, code) VALUES (?, ?)", [name, code.toUpperCase()]);
    res.status(201).json({ id: result.id, name, code: code.toUpperCase() });
  } catch (e) {
    if (e.message?.includes("UNIQUE")) return res.status(400).json({ message: "Department already exists" });
    sendError(res, "Error creating department");
  }
}


export async function updateDepartment(req, res) {
  try {
    const { name, code } = req.body;
    await runAsync("UPDATE departments SET name = ?, code = ? WHERE id = ?", [name, code?.toUpperCase(), req.params.id]);
    res.json({ success: true });
  } catch (e) { sendError(res, "Error updating department"); }
}


export async function deleteDepartment(req, res) {
  try {
    await runAsync("DELETE FROM departments WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (e) { sendError(res, "Error deleting department"); }
}


export async function getSubjects(req, res) {
  try { res.json(await allAsync("SELECT * FROM subjects ORDER BY name ASC")); }
  catch (e) { sendError(res, "Error getting subjects"); }
}


export async function getSubjectsByDepartment(req, res) {
  try { res.json(await allAsync("SELECT * FROM subjects WHERE department = ? ORDER BY name ASC", [req.params.department])); }
  catch (e) { sendError(res, "Error getting subjects"); }
}


export async function createSubject(req, res) {
  try {
    const { name, code, department, semester } = req.body;
    if (!name || !code || !department || !semester) return res.status(400).json({ message: "All fields are required" });
    const result = await runAsync("INSERT INTO subjects (name, code, department, semester) VALUES (?, ?, ?, ?)", [name, code.toUpperCase(), department, semester]);
    res.status(201).json({ id: result.id, name, code: code.toUpperCase(), department, semester });
  } catch (e) {
    if (e.message?.includes("UNIQUE")) return res.status(400).json({ message: "Subject with this code already exists" });
    sendError(res, "Error creating subject");
  }
}


export async function updateSubject(req, res) {
  try {
    const { name, code, department, semester } = req.body;
    await runAsync("UPDATE subjects SET name = ?, code = ?, department = ?, semester = ? WHERE id = ?", [name, code?.toUpperCase(), department, semester, req.params.id]);
    res.json({ success: true });
  } catch (e) { sendError(res, "Error updating subject"); }
}


export async function deleteSubject(req, res) {
  try {
    await runAsync("DELETE FROM subjects WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (e) { sendError(res, "Error deleting subject"); }
}
