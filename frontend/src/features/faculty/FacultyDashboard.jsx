import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getFacultyPackets } from "../../services/packetService";
import PacketProgress, { StatusPill } from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";
import { CardSkeleton, ListSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";

export default function FacultyDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [packets, setPackets] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadDashboard = () => {
      getFacultyPackets(user.role, user.email)
        .then((data) => {
          setPackets(data);
          setLastUpdated(new Date());
          setError("");
        })
        .catch((err) => {
          setError(err.message || "Unable to load dashboard");
          toast.error("Failed to load dashboard data");
        })
        .finally(() => setLoading(false));
    };

    loadDashboard();
    const timer = setInterval(loadDashboard, 10000);
    return () => clearInterval(timer);
  }, [toast, user]);

  const pendingCount = packets.filter((packet) => packet.status === "pending").length;
  const approvedCount = packets.filter((packet) => packet.status === "approved").length;
  const rejectedCount = packets.filter((packet) => packet.status === "rejected").length;

  const latestPackets = packets.slice(0, 4);

  const statCards = [
    { label: "Pending Review", value: pendingCount, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-amber-500 to-orange-500" },
    { label: "Approved", value: approvedCount, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-emerald-500 to-green-600" },
    { label: "Rejected", value: rejectedCount, icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-rose-500 to-red-600" },
  ];

  return (
    <Layout title="Faculty Dashboard" subtitle={`Welcome, ${user?.email || "Faculty"}`} onLogout={logout}>
      {}
      {loading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="stat-card-simple">
              <div className="flex items-center justify-between">
                <span className="stat-label">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
              <p className="stat-value">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <button onClick={() => navigate("/faculty/submit")} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Submit</span>
        </button>
        <button onClick={() => navigate("/faculty/remarks")} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Remarks</span>
        </button>
        <button onClick={() => navigate("/faculty/review")} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Review</span>
        </button>
      </div>

      {}
      <div className="mt-5 card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Latest Packets
          </h3>
          <LiveMeta lastUpdated={lastUpdated} />
        </div>

        {loading ? (
          <ListSkeleton count={3} />
        ) : latestPackets.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No packets submitted yet</p>
        ) : (
          <div className="space-y-2">
            {latestPackets.map((packet) => (
              <div key={packet.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{packet.title}</p>
                  <p className="text-xs text-slate-400">{packet.course}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={packet.status} />
                  <PacketProgress status={packet.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
