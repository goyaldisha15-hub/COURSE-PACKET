import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";

export default function FacultyDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout title="Faculty Dashboard" subtitle={`Welcome, ${user?.email || "Faculty"}`} onLogout={logout}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm text-slate-500">Pending Review</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">12</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-slate-500">Reviewed</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">34</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-slate-500">Remarks Added</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">27</p>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/faculty/submit")}
          className="btn-primary w-full"
        >
          Submit Packet
        </button>
        <button
          onClick={() => navigate("/faculty/remarks")}
          className="btn-secondary w-full"
        >
          Add/View Remarks
        </button>
        <button
          onClick={() => navigate("/faculty/review")}
          className="btn-secondary w-full"
        >
          Review Packets
        </button>
      </div>
    </Layout>
  );
}