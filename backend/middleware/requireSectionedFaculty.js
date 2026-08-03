import { findUserByEmail } from "../models/userModel.js";

export async function requireSectionedFaculty(req, res, next) {
  const roleHeader = req.headers["x-user-role"];
  const emailHeader = req.headers["x-user-email"];

  if (roleHeader !== "faculty") {
    return res.status(403).json({ message: "Access denied. Faculty role required." });
  }

  try {
    const user = await findUserByEmail(emailHeader);
    if (!user || user.role !== "faculty") {
      return res.status(403).json({ message: "Faculty user not found." });
    }

    if (!user.section) {
      return res.status(403).json({ message: "Faculty must have an assigned section to upload courses." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in requireSectionedFaculty:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
