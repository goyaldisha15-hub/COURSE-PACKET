import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getFacultyPackets } from "../../services/packetService";
import PacketProgress, { StatusPill } from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";
import PacketDetailsModal from "../../components/common/PacketDetailsModal";

export default function ReviewPackets() {
  const { logout, user } = useAuth();
  const [packets, setPackets] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activePacket, setActivePacket] = useState(null);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadPackets = () => {
      getFacultyPackets(user.role, user.email)
        .then((data) => {
          setPackets(data);
          setLastUpdated(new Date());
          setError(null);
        })
        .catch((err) => setError(err.message || "Unable to load packets"))
        .finally(() => setLoading(false));
    };

    loadPackets();
    const timer = setInterval(loadPackets, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const visiblePackets = packets.filter((packet) => statusFilter === "all" || packet.status === statusFilter);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const exportCSV = () => {
    const rows = visiblePackets.map((p) => `${p.id},${p.course},${p.title},${p.status}`);
    const csv = ["id,course,packet,status", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculty_packets.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout
      title="Review Packets"
      subtitle="Check student packet requests"
      onLogout={logout}
    >
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Packet List</h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={exportCSV} className="btn-secondary">Export</button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading packets...</p>
        ) : error ? (
          <p className="text-rose-600">{error}</p>
        ) : visiblePackets.length === 0 ? (
          <p className="text-slate-600">No packets submitted yet.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">Select</th>
                <th className="p-3">ID</th>
                <th className="p-3">Course</th>
                <th className="p-3">Packet</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {visiblePackets.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="p-3"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /></td>
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.course}</td>
                  <td className="p-3">{item.title}</td>
                  <td className="p-3"><StatusPill status={item.status} /></td>
                  <td className="p-3"><PacketProgress status={item.status} /></td>
                  <td className="p-3">
                    <button onClick={() => setActivePacket(item)} className="btn-secondary">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )} 
      </div>
      <PacketDetailsModal packet={activePacket} onClose={() => setActivePacket(null)} />
    </Layout>
  );
}
