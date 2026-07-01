import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../../components/layout/Layout";
import { getApprovedPackets } from "../../../services/packetService";

function StatusBadge({ status }) {
  const color =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "rejected"
      ? "bg-rose-100 text-rose-700"
      : "bg-slate-100 text-slate-700";

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{status}</span>;
}

export default function ApprovedPackets() {
  const { user, logout } = useAuth();
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    getApprovedPackets(user.role, user.email)
      .then((data) => {
        setPackets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load approved packets");
        setLoading(false);
      });
  }, [user]);

  return (
    <Layout title="Approved Packets" subtitle="View approved faculty packet data" onLogout={logout}>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Approved Packet Data</h3>
          <p className="text-sm text-slate-500">Only approved packets are visible to students.</p>
        </div>

        {loading ? (
          <p>Loading approved data...</p>
        ) : error ? (
          <p className="text-rose-600">{error}</p>
        ) : packets.length === 0 ? (
          <p className="text-slate-600">No approved packets available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Submitted By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {packets.map((packet) => (
                  <tr key={packet.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">{packet.id}</td>
                    <td className="p-3">{packet.title}</td>
                    <td className="p-3">{packet.course}</td>
                    <td className="p-3">{packet.facultyEmail}</td>
                    <td className="p-3"><StatusBadge status={packet.status} /></td>
                    <td className="p-3">{new Date(packet.createdAt).toLocaleDateString()}</td>
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
