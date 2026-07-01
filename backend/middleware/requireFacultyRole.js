export function requireFacultyRole(req, res, next) {
  const roleHeader = req.headers["x-user-role"];
  if (roleHeader !== "faculty") {
    return res.status(403).json({ message: "Access denied. Faculty role required." });
  }
  next();
}
