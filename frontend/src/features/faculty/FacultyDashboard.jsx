import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getFacultyPackets } from "../../services/packetService";
import PacketProgress, { StatusPill } from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";

export default function FacultyDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [packets, setPackets] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadDashboard = () => {
      getFacultyPackets(user.role, user.email)
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

  const stats = useMemo(() => ({
    pending: packets.filter((packet) => packet.status === "pending").length,
    approved: packets.filter((packet) => packet.status === "approved").length,
    rejected: packets.filter((packet) => packet.status === "rejected").length,
  }), [packets]);

  const latestPackets = packets.slice(0, 3);

  return (
    <Layout title="Faculty Dashboard" subtitle={`Welcome, ${user?.email || "Faculty"}`} onLogout={logout}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm text-slate-500">Pending Review</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{stats.pending}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-slate-500">Approved</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{stats.approved}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-slate-500">Rejected</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">{stats.rejected}</p>
        </div>
      </div>

      {error && <p className="mt-4 text-rose-600">{error}</p>}

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/faculty/submit")}
          className="btn-primary w-full"
        >
          Submit Packet
        </button>
        <button
          onClick={() => navigate("/faculty/remarks")}
          className="btn-secondary w-full"
        >
          Add/View Remarks
        </button>
        <button
          onClick={() => navigate("/faculty/review")}
          className="btn-secondary w-full"
        >
          Review Packets
        </button>
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Latest Packet Progress</h3>
          <LiveMeta lastUpdated={lastUpdated} />
        </div>
        <div className="mt-4 space-y-4">
          {latestPackets.length === 0 ? (
            <p className="text-slate-600">No packets submitted yet.</p>
          ) : (
            latestPackets.map((packet) => (
              <div key={packet.id} className="grid gap-3 border-b pb-4 last:border-0 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-medium text-slate-800">{packet.title}</p>
                  <p className="text-sm text-slate-500">{packet.course}</p>
                  <div className="mt-2"><StatusPill status={packet.status} /></div>
                </div>
                <PacketProgress status={packet.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
