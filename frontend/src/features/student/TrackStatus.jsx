import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getPackets } from "../../services/packetService";
import PacketProgress from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";

function formatStatus(status) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
}

function StatusBadge({ status }) {
  const color =
    status === "Approved"
      ? "bg-green-100 text-green-700"
      : status === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status}
    </span>
  );
}

export default function TrackStatus() {
  const { logout, user } = useAuth();
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadStatus = () => {
      getPackets(user.email, user.role)
        .then((data) => {
          setStatusData(data);
          setLastUpdated(new Date());
          setError(null);
        })
        .catch((err) => setError(err.message || "Unable to load status"))
        .finally(() => setLoading(false));
    };

    loadStatus();
    const timer = setInterval(loadStatus, 10000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <Layout
      title="Track Status"
      subtitle="Check your packet request progress"
      onLogout={logout}
    >
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Request History</h3>
          <LiveMeta lastUpdated={lastUpdated} />
        </div>

        {loading ? (
          <p className="text-slate-600">Loading status...</p>
        ) : error ? (
          <p className="text-rose-600">{error}</p>
        ) : statusData.length === 0 ? (
          <p className="text-slate-600">No approved packets available yet.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">ID</th>
                <th className="p-3">Packet</th>
                <th className="p-3">Course</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {statusData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.title}</td>
                  <td className="p-3">{item.course}</td>
                  <td className="p-3">
                    <StatusBadge status={formatStatus(item.status)} />
                  </td>
                  <td className="p-3"><PacketProgress status={item.status} /></td>
                  <td className="p-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </Layout>
  );
}
