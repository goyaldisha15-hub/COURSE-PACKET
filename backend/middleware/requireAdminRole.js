export function requireAdminRole(req, res, next) {
  const roleHeader = req.headers["x-user-role"];
  if (roleHeader !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
  next();
}
