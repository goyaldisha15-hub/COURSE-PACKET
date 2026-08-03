import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import { getPendingPackets, approvePacket, rejectPacket } from "../../services/packetService";
import LiveMeta from "../../components/common/LiveMeta";
import { TableSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";

function StatusBadge({ status }) {
  const color =
    status === "approved"
      ? "badge-approved"
      : status === "rejected"
      ? "badge-rejected"
      : "badge-pending";

  return <span className={color}>{status}</span>;
}

export default function AdminApproval() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadPending = () => {
      getPendingPackets(user.role, user.email)
        .then((data) => {
          setPackets(data);
          setLastUpdated(new Date());
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Unable to load pending packets");
          setLoading(false);
        });
    };

    loadPending();
    const timer = setInterval(loadPending, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const handleAction = async (id, action) => {
    try {
      const updated = action === "approve"
        ? await approvePacket(id, user.role, user.email)
        : await rejectPacket(id, user.role, user.email);

      setPackets((current) => current.filter((packet) => packet.id !== updated.id));
      setSelected((s) => s.filter((x) => x !== id));
      toast.success(`Packet #${id} ${action === "approve" ? "approved" : "rejected"} successfully`);
    } catch (err) {
      setError(err.message || "Could not update packet");
      toast.error(err.message || "Could not update packet");
    }
  };

  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectAll = (checked) => {
    setSelected(checked ? packets.map((p) => p.id) : []);
  };

  const bulkUpdate = async (action) => {
    if (!selected.length) {
      toast.warning("Please select at least one packet before applying bulk actions.");
      return;
    }

    try {
      for (const id of selected) {
        await handleAction(id, action);
      }
      toast.success(`Bulk ${action} completed for ${selected.length} packets`);
    } catch (err) {
      setError(err.message || "Could not update packets");
    }
  };

  const exportCSV = () => {
    const exportPackets = selected.length ? packets.filter((p) => selected.includes(p.id)) : packets;
    if (!exportPackets.length) {
      toast.warning("No packets available to export.");
      return;
    }

    const rows = exportPackets.map((p) => `${p.id},${p.title},${p.course},${p.facultyEmail},${p.status},${new Date(p.createdAt).toLocaleDateString()}`);
    const csv = ["id,title,course,faculty_email,status,submitted_date", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pending_packets.csv";
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
    <Layout title="Admin Approval" subtitle="Approve or reject faculty packet requests" onLogout={logout}>
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="section-title">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Pending Approval
            </h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => bulkUpdate("approve")} className="btn-success btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bulk Approve
            </button>
            <button onClick={() => bulkUpdate("reject")} className="btn-danger btn-sm">
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

        {loading ? (
          <TableSkeleton rows={4} cols={8} />
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : packets.length === 0 ? (
          <div className="empty-state">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 font-medium">No pending packets</p>
            <p className="text-sm text-slate-400 mt-1">All packets have been reviewed</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80">
                  <th className="table-header w-12">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      onChange={(e) => selectAll(e.target.checked)}
                      checked={selected.length === packets.length && packets.length > 0}
                    />
                  </th>
                  <th className="table-header">ID</th>
                  <th className="table-header">Title</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Faculty</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Submitted</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {packets.map((packet, idx) => (
                  <tr key={packet.id} className="table-row animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={selected.includes(packet.id)}
                        onChange={() => toggle(packet.id)}
                      />
                    </td>
                    <td className="table-cell font-medium text-slate-800">#{packet.id}</td>
                    <td className="table-cell font-medium text-slate-800">{packet.title}</td>
                    <td className="table-cell">{packet.course}</td>
                    <td className="table-cell">{packet.facultyEmail}</td>
                    <td className="table-cell"><StatusBadge status={packet.status} /></td>
                    <td className="table-cell text-slate-500">{new Date(packet.createdAt).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(packet.id, "approve")}
                          className="btn-success btn-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(packet.id, "reject")}
                          className="btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </div>
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
