import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getRedirectPath = (role) => {
  if (role === "admin") return "/admin";
  if (role === "faculty") return "/faculty";
  if (role === "student") return "/student";
  return "/login";
};

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRedirectPath(user.role)} replace />;
  }

  return <Outlet />;
}