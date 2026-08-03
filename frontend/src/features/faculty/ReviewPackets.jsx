import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getFacultyPackets, editFacultyPacket, deleteFacultyPacket } from "../../services/packetService";
import PacketProgress, { StatusPill } from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";
import PacketDetailsModal from "../../components/common/PacketDetailsModal";
import { TableSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";

function EditPacketModal({ isOpen, onClose, packet, onSubmit, loading }) {
  const [form, setForm] = useState({ title: "", course: "", description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (packet) {
      setForm({
        title: packet.title || "",
        course: packet.course || "",
        description: packet.description || "",
      });
    }
  }, [packet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.course.trim() || !form.description.trim()) {
      setError("All fields are required");
      return;
    }
    try {
      await onSubmit(packet.id, form);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Edit Packet</h2>
        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Title</label>
            <input type="text" className="form-input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Course</label>
            <input type="text" className="form-input" value={form.course} onChange={(e) => setForm({...form, course: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-textarea min-h-20" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReviewPackets() {
  const { logout, user } = useAuth();
  const toast = useToast();
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activePacket, setActivePacket] = useState(null);


  const [editingPacket, setEditingPacket] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadPackets = () => {
      getFacultyPackets(user.role, user.email)
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

  const visiblePackets = packets.filter((packet) => statusFilter === "all" || packet.status === statusFilter);

  const handleEdit = async (packetId, formData) => {
    setEditLoading(true);
    try {
      const updated = await editFacultyPacket(packetId, formData, user.role, user.email);
      setPackets((prev) => prev.map((p) => (p.id === packetId ? updated : p)));
      toast.success("Packet updated successfully!");
    } catch (err) {
      toast.error(err.message);
      throw err;
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteFacultyPacket(deleteTarget.id, user.role, user.email);
      setPackets((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Packet deleted successfully!");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const exportCSV = () => {
    if (!visiblePackets.length) {
      toast.warning("No packets to export.");
      return;
    }
    const rows = visiblePackets.map((p) => `${p.id},${p.course},${p.title},${p.status}`);
    const csv = ["id,course,packet,status", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculty_packets.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${visiblePackets.length} packets`);
  };

  return (
    <Layout title="Review Packets" subtitle="Check your submitted packet requests" onLogout={logout}>
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="section-title">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Packet List
            </h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="form-select text-sm py-2">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={exportCSV} className="btn-secondary btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={7} />
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
            <p className="text-slate-500 font-medium">No packets submitted yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80">
                  <th className="table-header">ID</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Packet</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Progress</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePackets.map((item, idx) => (
                  <tr key={item.id} className="table-row animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="table-cell font-medium text-slate-800">#{item.id}</td>
                    <td className="table-cell">{item.course}</td>
                    <td className="table-cell font-medium text-slate-800">{item.title}</td>
                    <td className="table-cell"><StatusPill status={item.status} /></td>
                    <td className="table-cell"><PacketProgress status={item.status} /></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button onClick={() => setActivePacket(item)} className="btn-outline btn-sm">
                          View
                        </button>
                        {item.status === "pending" && (
                          <>
                            <button onClick={() => setEditingPacket(item)} className="btn-secondary btn-sm">
                              Edit
                            </button>
                            <button onClick={() => setDeleteTarget(item)} className="btn-danger btn-sm">
                              Delete
                            </button>
                          </>
                        )}
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
      <EditPacketModal isOpen={!!editingPacket} onClose={() => setEditingPacket(null)} packet={editingPacket} onSubmit={handleEdit} loading={editLoading} />
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Packet"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        type="danger"
      />
    </Layout>
  );
}
