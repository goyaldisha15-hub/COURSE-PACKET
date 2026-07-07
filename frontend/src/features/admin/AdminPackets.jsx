import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import { approvePacket, getAllPackets, rejectPacket } from "../../services/packetService";
import PacketProgress from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";
import PacketDetailsModal from "../../components/common/PacketDetailsModal";

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

export default function AdminPackets() {
  const { logout, user } = useAuth();
  const [packets, setPackets] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activePacket, setActivePacket] = useState(null);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadPackets = () => {
      getAllPackets(user.role, user.email)
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

  const visiblePackets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return packets.filter((packet) => {
      const matchesStatus = statusFilter === "all" || packet.status === statusFilter;
      const matchesSearch =
        !term ||
        [packet.title, packet.course, packet.facultyEmail]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [packets, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      const updated =
        status === "approved"
          ? await approvePacket(id, user.role, user.email)
          : await rejectPacket(id, user.role, user.email);
      setPackets((current) =>
        current.map((packet) => (packet.id === id ? updated : packet))
      );
      setSelected((s) => s.filter((x) => x !== id));
      setError(null);
    } catch (err) {
      setError(err.message || "Could not update packet");
    }
  };

  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectAll = (checked) => {
    setSelected(checked ? visiblePackets.map((p) => p.id) : []);
  };

  const bulkUpdate = async (status) => {
    if (!selected.length) {
      alert("Please select at least one packet before applying bulk actions.");
      return;
    }

    for (const id of selected) {
      await updateStatus(id, status);
    }
  };

  const exportCSV = () => {
    const exportPackets = selected.length ? packets.filter((p) => selected.includes(p.id)) : visiblePackets;
    if (!exportPackets.length) {
      alert("No packets available to export.");
      return;
    }

    const rows = exportPackets.map((p) => `${p.id},${p.facultyEmail},${p.title},${p.course},${formatStatus(p.status)}`);
    const csv = ["id,faculty_email,packet,course,status", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packets.csv";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <Layout
      title="Approve Packets"
      subtitle={`Manage packet approvals, ${user?.email || "Admin"}`}
      onLogout={logout}
    >
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Packet Requests</h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => bulkUpdate("approved")} className="btn-primary">Bulk Approve</button>
            <button onClick={() => bulkUpdate("rejected")} className="btn-secondary">Bulk Reject</button>
            <button onClick={exportCSV} className="btn-secondary">Export CSV</button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search packet, course, faculty..."
            className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading packets...</p>
        ) : error ? (
          <p className="text-rose-600">{error}</p>
        ) : visiblePackets.length === 0 ? (
          <p className="text-slate-600">No packets available.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">
                  <input type="checkbox" onChange={(e) => selectAll(e.target.checked)} checked={selected.length === visiblePackets.length && visiblePackets.length > 0} />
                </th>
                <th className="p-3">ID</th>
                <th className="p-3">Faculty</th>
                <th className="p-3">Packet</th>
                <th className="p-3">Course</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {visiblePackets.map((packet) => (
                <tr key={packet.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(packet.id)} onChange={() => toggle(packet.id)} />
                  </td>
                  <td className="p-3">{packet.id}</td>
                  <td className="p-3">{packet.facultyEmail}</td>
                  <td className="p-3">{packet.title}</td>
                  <td className="p-3">{packet.course}</td>
                  <td className="p-3">
                    <StatusBadge status={formatStatus(packet.status)} />
                  </td>
                  <td className="p-3"><PacketProgress status={packet.status} /></td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => updateStatus(packet.id, "approved")}
                      className="px-3 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(packet.id, "rejected")}
                      className="px-3 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setActivePacket(packet)}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      View
                    </button>
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
