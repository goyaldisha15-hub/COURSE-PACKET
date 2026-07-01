import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";

export default function StudentDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout title="Student Dashboard" subtitle={`Welcome, ${user?.email || "Student"}`} onLogout={logout}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800">Current Status</h3>
          <p className="mt-2 text-green-600 font-medium">Approved</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/student/request")}
              className="btn-primary w-full"
            >
              Request New Packet
            </button>
            <button
              onClick={() => navigate("/student/approved")}
              className="btn-secondary w-full"
            >
              View Approved Packets
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800">Course Tracking</h3>
          <p className="mt-2 text-slate-600">See enrolled courses, progress, and next lessons.</p>
          <div className="mt-5">
            <button
              onClick={() => navigate("/student/courses")}
              className="btn-primary w-full"
            >
              Open Course Tracking
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}