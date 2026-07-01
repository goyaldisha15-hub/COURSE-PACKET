import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";

function StatCard({ title, value, color }) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white rounded-2xl p-5 shadow`}>
      <h3 className="text-sm opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const recentRequests = [
    { id: 101, student: "Aman", packet: "Packet A", status: "Pending" },
    { id: 102, student: "Riya", packet: "Packet B", status: "Approved" },
    { id: 103, student: "Karan", packet: "Packet C", status: "Rejected" },
  ];

  return (
    <Layout title="Admin Dashboard" subtitle={`Welcome, ${user?.email || "Admin"}`} onLogout={logout}>
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="120" color="from-indigo-500 to-blue-600" />
        <StatCard title="Pending Packets" value="18" color="from-yellow-400 to-orange-500" />
        <StatCard title="Approved" value="84" color="from-green-500 to-emerald-600" />
        <StatCard title="Rejected" value="6" color="from-rose-500 to-red-600" />
      </section>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate("/admin/approval")}
          className="btn-primary w-full"
        >
          Approval Workflow
        </button>
        <button
          onClick={() => navigate("/admin/users")}
          className="btn-secondary w-full"
        >
          Manage Users
        </button>
        <button
          onClick={() => navigate("/admin/reports")}
          className="btn-secondary w-full"
        >
          View Reports
        </button>
        <button
          onClick={() => navigate("/admin/packets")}
          className="btn-secondary w-full"
        >
          Recent Activity
        </button>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Recent Packet Requests</h3>
          <span className="text-sm text-slate-500">Updated just now</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">Request ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Packet</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{request.id}</td>
                  <td className="p-3">{request.student}</td>
                  <td className="p-3">{request.packet}</td>
                  <td className="p-3">{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}