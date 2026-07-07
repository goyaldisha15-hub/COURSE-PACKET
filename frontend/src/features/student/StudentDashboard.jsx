import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getPackets } from "../../services/packetService";
import PacketProgress, { StatusPill } from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";

export default function StudentDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [packets, setPackets] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadDashboard = () => {
      getPackets(user.email, user.role)
        .then((data) => {
          setPackets(data);
          setLastUpdated(new Date());
          setError("");
        })
        .catch((err) => setError(err.message || "Unable to load dashboard"));
    };

    loadDashboard();
    const timer = setInterval(loadDashboard, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const latestPacket = packets[0];
  const approvedCount = packets.length;
  const statusText = useMemo(() => (latestPacket ? latestPacket.status : "pending"), [latestPacket]);

  return (
    <Layout title="Student Dashboard" subtitle={`Welcome, ${user?.email || "Student"}`} onLogout={logout}>
      {error && <p className="mb-4 text-rose-600">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Current Status</h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StatusPill status={statusText} />
            <span className="text-sm text-slate-500">{approvedCount} approved packets available</span>
          </div>
          <div className="mt-4">
            <PacketProgress status={statusText} />
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/student/request")}
              className="btn-primary w-full"
            >
              Request New Packet
            </button>
            <button
              onClick={() => navigate("/student/approved")}
              className="btn-secondary w-full"
            >
              View Approved Packets
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800">Course Tracking</h3>
          <p className="mt-2 text-slate-600">
            {latestPacket ? `Latest packet: ${latestPacket.title}` : "See enrolled courses, progress, and next lessons."}
          </p>
          <div className="mt-5">
            <button
              onClick={() => navigate("/student/courses")}
              className="btn-primary w-full"
            >
              Open Course Tracking
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
