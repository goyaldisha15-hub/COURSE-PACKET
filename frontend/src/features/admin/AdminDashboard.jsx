import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getAllPackets } from "../../services/packetService";
import { getUsers } from "../../services/authService";
import LiveMeta from "../../components/common/LiveMeta";
import { StatusPill } from "../../components/common/PacketProgress";

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
  const [packets, setPackets] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadDashboard = () => {
      Promise.all([getAllPackets(user.role, user.email), getUsers(user.role, user.email)])
        .then(([packetData, userData]) => {
          setPackets(packetData);
          setUsers(userData);
          setLastUpdated(new Date());
          setError(null);
        })
        .catch((err) => setError(err.message || "Unable to load dashboard data"));
    };

    loadDashboard();
    const timer = setInterval(loadDashboard, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const stats = useMemo(() => {
    const countByStatus = (status) => packets.filter((packet) => packet.status === status).length;
    return {
      totalUsers: users.length,
      pending: countByStatus("pending"),
      approved: countByStatus("approved"),
      rejected: countByStatus("rejected"),
    };
  }, [packets, users]);

  const recentRequests = packets.slice(0, 3);
  const priorityPackets = useMemo(
    () => packets.filter((packet) => packet.status === "pending").slice(-3).reverse(),
    [packets]
  );

  return (
    <Layout title="Admin Dashboard" subtitle={`Welcome, ${user?.email || "Admin"}`} onLogout={logout}>
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} color="from-indigo-500 to-blue-600" />
        <StatCard title="Pending Packets" value={stats.pending} color="from-yellow-400 to-orange-500" />
        <StatCard title="Approved" value={stats.approved} color="from-green-500 to-emerald-600" />
        <StatCard title="Rejected" value={stats.rejected} color="from-rose-500 to-red-600" />
      </section>

      {error && <p className="mt-4 text-rose-600">{error}</p>}

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
          <LiveMeta lastUpdated={lastUpdated} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">Request ID</th>
                  <th className="p-3">Faculty</th>
                  <th className="p-3">Packet</th>
                  <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{request.id}</td>
                  <td className="p-3">{request.facultyEmail}</td>
                  <td className="p-3">{request.title}</td>
                  <td className="p-3"><StatusPill status={request.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Priority Queue</h3>
          <button onClick={() => navigate("/admin/approval")} className="btn-primary">Review Now</button>
        </div>
        {priorityPackets.length === 0 ? (
          <p className="text-slate-600">No pending packets need attention.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {priorityPackets.map((packet) => (
              <div key={packet.id} className="rounded-xl border p-4">
                <div className="mb-3"><StatusPill status={packet.status} /></div>
                <p className="font-semibold text-slate-800">{packet.title}</p>
                <p className="text-sm text-slate-500">{packet.course}</p>
                <p className="mt-3 text-xs text-slate-400">Submitted {new Date(packet.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
