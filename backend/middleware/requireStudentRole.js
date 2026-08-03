export function requireStudentRole(req, res, next) {
  const roleHeader = req.headers["x-user-role"];
  if (roleHeader !== "student") {
    return res.status(403).json({ message: "Access denied. Student role required." });
  }
  next();
}

