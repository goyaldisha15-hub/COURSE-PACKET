import { addBookmark, removeBookmark, getStudentBookmarks, isBookmarked } from "../models/bookmarkModel.js";


function getEmail(req) {
  return req.headers["x-user-email"];
}


export async function handleAddBookmark(req, res) {
  try {
    const { packetId } = req.body;
    if (!packetId || !getEmail(req)) return res.status(400).json({ message: "Packet ID and email required" });
    res.json(await addBookmark(getEmail(req), packetId));
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleRemoveBookmark(req, res) {
  try {
    res.json(await removeBookmark(getEmail(req), req.params.packetId));
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleGetBookmarks(req, res) {
  try {
    res.json(await getStudentBookmarks(getEmail(req)));
  } catch (error) {
    console.error("Error getting bookmarks:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function handleCheckBookmark(req, res) {
  try {
    res.json({ bookmarked: await isBookmarked(getEmail(req), req.params.packetId) });
  } catch (error) {
    console.error("Error checking bookmark:", error);
    res.status(500).json({ message: "Server error" });
  }
}
