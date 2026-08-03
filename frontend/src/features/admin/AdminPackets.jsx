import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import { approvePacket, getAllPackets, rejectPacket } from "../../services/packetService";
import PacketProgress from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";
import PacketDetailsModal from "../../components/common/PacketDetailsModal";
import { TableSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";

function formatStatus(status) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
}

function StatusBadge({ status }) {
  const cls =
    status === "Approved"
      ? "badge-approved"
      : status === "Rejected"
      ? "badge-rejected"
      : "badge-pending";

  return <span className={cls}>{status}</span>;
}

export default function AdminPackets() {
  const { logout, user } = useAuth();
  const toast = useToast();
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
        .catch((err) => {
          setError(err.message || "Unable to load packets");
          toast.error("Failed to load packets");
        })
        .finally(() => setLoading(false));
    };

    loadPackets();
    const timer = setInterval(loadPackets, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const term = search.trim().toLowerCase();
  const visiblePackets = packets.filter((packet) => {
    const matchesStatus = statusFilter === "all" || packet.status === statusFilter;
    const matchesSearch =
      !term ||
      [packet.title, packet.course, packet.facultyEmail]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

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
      toast.success(`Packet #${id} ${status} successfully`);
    } catch (err) {
      setError(err.message || "Could not update packet");
      toast.error(err.message || "Could not update packet");
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
      toast.warning("Please select at least one packet before applying bulk actions.");
      return;
    }

    for (const id of selected) {
      await updateStatus(id, status);
    }
    toast.success(`Bulk ${status} completed for ${selected.length} packets`);
  };

  const exportCSV = () => {
    const exportPackets = selected.length ? packets.filter((p) => selected.includes(p.id)) : visiblePackets;
    if (!exportPackets.length) {
      toast.warning("No packets available to export.");
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
    toast.success(`Exported ${exportPackets.length} packets to CSV`);
  };

  return (
    <Layout
      title="Approve Packets"
      subtitle={`Manage packet approvals, ${user?.email || "Admin"}`}
      onLogout={logout}
    >
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="section-title">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Packet Requests
            </h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => bulkUpdate("approved")} className="btn-success btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bulk Approve
            </button>
            <button onClick={() => bulkUpdate("rejected")} className="btn-danger btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bulk Reject
            </button>
            <button onClick={exportCSV} className="btn-secondary btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative">
            <svg className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search packet, course, faculty..."
              className="form-input pl-11"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="form-select"
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={8} />
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : visiblePackets.length === 0 ? (
          <div className="empty-state">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-500 font-medium">No packets available</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80">
                  <th className="table-header w-12">
                    <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" onChange={(e) => selectAll(e.target.checked)} checked={selected.length === visiblePackets.length && visiblePackets.length > 0} />
                  </th>
                  <th className="table-header">ID</th>
                  <th className="table-header">Faculty</th>
                  <th className="table-header">Packet</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Progress</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {visiblePackets.map((packet, idx) => (
                  <tr key={packet.id} className="table-row animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="table-cell">
                      <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selected.includes(packet.id)} onChange={() => toggle(packet.id)} />
                    </td>
                    <td className="table-cell font-medium text-slate-800">#{packet.id}</td>
                    <td className="table-cell">{packet.facultyEmail}</td>
                    <td className="table-cell font-medium text-slate-800">{packet.title}</td>
                    <td className="table-cell">{packet.course}</td>
                    <td className="table-cell">
                      <StatusBadge status={formatStatus(packet.status)} />
                    </td>
                    <td className="table-cell"><PacketProgress status={packet.status} /></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button onClick={() => updateStatus(packet.id, "approved")} className="btn-success btn-sm">Approve</button>
                        <button onClick={() => updateStatus(packet.id, "rejected")} className="btn-danger btn-sm">Reject</button>
                        <button onClick={() => setActivePacket(packet)} className="btn-secondary btn-sm">View</button>
                      </div>
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
