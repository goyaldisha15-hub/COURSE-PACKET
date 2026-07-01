import { findUserByEmail } from "../models/userModel.js";

export function requireSectionedFaculty(req, res, next) {
  const roleHeader = req.headers["x-user-role"];
  const emailHeader = req.headers["x-user-email"];

  if (roleHeader !== "faculty") {
    return res.status(403).json({ message: "Access denied. Faculty role required." });
  }

  const user = findUserByEmail(emailHeader);
  if (!user || user.role !== "faculty") {
    return res.status(403).json({ message: "Faculty user not found." });
  }

  if (!user.section) {
    return res.status(403).json({ message: "Faculty must have an assigned section to upload courses." });
  }

  req.user = user;
  next();
}
