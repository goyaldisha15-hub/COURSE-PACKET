import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import { getPendingPackets, approvePacket, rejectPacket } from "../../services/packetService";

function StatusBadge({ status }) {
  const color =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "rejected"
      ? "bg-rose-100 text-rose-700"
      : "bg-yellow-100 text-yellow-700";

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{status}</span>;
}

export default function AdminApproval() {
  const { user, logout } = useAuth();
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    getPendingPackets(user.role, user.email)
      .then((data) => {
        setPackets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load pending packets");
        setLoading(false);
      });
  }, [user]);

  const handleAction = async (id, action) => {
    try {
      const updated = action === "approve"
        ? await approvePacket(id, user.role, user.email)
        : await rejectPacket(id, user.role, user.email);

      setPackets((current) => current.filter((packet) => packet.id !== updated.id));
    } catch (err) {
      setError(err.message || "Could not update packet");
    }
  };

  return (
    <Layout title="Admin Approval" subtitle="Approve or reject faculty packet requests" onLogout={logout}>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Pending Approval</h3>
          <p className="text-sm text-slate-500">Only admin can approve or reject.</p>
        </div>

        {loading ? (
          <p>Loading pending packets...</p>
        ) : error ? (
          <p className="text-rose-600">{error}</p>
        ) : packets.length === 0 ? (
          <p className="text-slate-600">No pending packets available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Faculty</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Action</th>
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
                    <td className="p-3 space-x-2">
                      <button onClick={() => handleAction(packet.id, "approve")} className="btn-primary">Approve</button>
                      <button onClick={() => handleAction(packet.id, "reject")} className="btn-secondary">Reject</button>
                    </td>
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
