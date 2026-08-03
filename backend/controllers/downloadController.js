import { getStudentDownloads, getRecentDownloads, getFacultyTotalDownloads } from "../models/downloadModel.js";


function getEmail(req) {
  return req.headers["x-user-email"];
}


export async function handleGetDownloads(req, res) {
  try {
    if (!getEmail(req)) return res.status(400).json({ message: "User email is required" });
    res.json(await getStudentDownloads(getEmail(req)));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleGetRecentDownloads(req, res) {
  try {
    res.json(await getRecentDownloads(getEmail(req)));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleGetFacultyDownloads(req, res) {
  try {
    res.json({ total: await getFacultyTotalDownloads(getEmail(req)) });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
