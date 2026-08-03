import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getPackets } from "../../services/packetService";
import PacketProgress, { StatusPill } from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";
import { CardSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";

export default function StudentDashboard() {
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
      getPackets(user.email, user.role)
        .then((data) => {
          setPackets(data);
          setLastUpdated(new Date());
          setError("");
        })
        .catch((err) => {
          setError(err.message || "Unable to load dashboard");
          toast.error("Failed to load dashboard");
        })
        .finally(() => setLoading(false));
    };

    loadDashboard();
    const timer = setInterval(loadDashboard, 10000);
    return () => clearInterval(timer);
  }, [toast, user]);

  const latestPacket = packets[0];
  const approvedCount = packets.length;
  const statusText = latestPacket ? latestPacket.status : "pending";

  return (
    <Layout title="Student Dashboard" subtitle={`Welcome, ${user?.email || "Student"}`} onLogout={logout}>
      {error && (
        <div className="mb-3 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <CardSkeleton count={2} />
      ) : (
        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          {}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Current Status
              </h3>
              <LiveMeta lastUpdated={lastUpdated} />
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusPill status={statusText} />
                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{approvedCount}</span> approved packets
                </span>
              </div>
              <div className="mt-3">
                <PacketProgress status={statusText} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button onClick={() => navigate("/student/request")} className="btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Request</span>
              </button>
              <button onClick={() => navigate("/student/approved")} className="btn-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Approved</span>
              </button>
            </div>
          </div>

          {}
          <div className="card">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base mb-3">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Course Tracking
            </h3>
            <div className="bg-slate-50 rounded-xl p-4">
              {latestPacket ? (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Latest packet:</p>
                  <p className="font-semibold text-slate-700">{latestPacket.title}</p>
                  <p className="text-xs text-slate-400">{new Date(latestPacket.updatedAt || latestPacket.createdAt).toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">See enrolled courses and progress</p>
              )}
            </div>
            <div className="mt-3">
              <button onClick={() => navigate("/student/courses")} className="btn-primary w-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>Open Course Tracking</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
