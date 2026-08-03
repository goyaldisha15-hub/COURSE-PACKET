import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getPackets } from "../../services/packetService";
import PacketProgress from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";
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

export default function TrackStatus() {
  const { logout, user } = useAuth();
  const toast = useToast();
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
        .catch((err) => {
          setError(err.message || "Unable to load status");
          toast.error("Failed to load status");
        })
        .finally(() => setLoading(false));
    };

    loadStatus();
    const timer = setInterval(loadStatus, 10000);
    return () => clearInterval(timer);
  }, [toast, user]);

  return (
    <Layout
      title="Track Status"
      subtitle="Check your packet request progress"
      onLogout={logout}
    >
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="section-title">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Request History
          </h3>
          <LiveMeta lastUpdated={lastUpdated} />
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : statusData.length === 0 ? (
          <div className="empty-state">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500 font-medium">No requests yet</p>
            <p className="text-sm text-slate-400 mt-1">Submit a packet request to track its status</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80">
                  <th className="table-header">ID</th>
                  <th className="table-header">Packet</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Progress</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {statusData.map((item, idx) => (
                  <tr key={item.id} className="table-row animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="table-cell font-medium text-slate-800">#{item.id}</td>
                    <td className="table-cell font-medium text-slate-800">{item.title}</td>
                    <td className="table-cell">{item.course}</td>
                    <td className="table-cell">
                      <StatusBadge status={formatStatus(item.status)} />
                    </td>
                    <td className="table-cell"><PacketProgress status={item.status} /></td>
                    <td className="table-cell text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
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
