import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = {
  admin: [
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/admin/packets", label: "Approve Packets" },
    { to: "/admin/approval", label: "Approval Workflow" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/users", label: "Users" },
  ],
  faculty: [
    { to: "/faculty", label: "Faculty Dashboard" },
    { to: "/faculty/submit", label: "Submit Packet" },
    { to: "/faculty/review", label: "Review Packets" },
  ],
  student: [
    { to: "/student", label: "Student Dashboard" },
    { to: "/student/request", label: "Request Packet" },
    { to: "/student/track", label: "Track Request Status" },
    { to: "/student/courses", label: "Course Tracking" },
    { to: "/student/approved", label: "Approved Packets" },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = user ? menuItems[user.role] || [] : [];

  if (!items.length) return null;

  return (
    <aside className="w-64 bg-slate-900 text-white p-5 hidden md:block">
      <h1 className="text-2xl font-bold text-indigo-400">Packet Track</h1>

      <nav className="mt-8 space-y-3">
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg hover:bg-slate-800 transition ${isActive ? 'bg-slate-800' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}