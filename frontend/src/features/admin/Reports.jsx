import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getAllPackets } from "../../services/packetService";
import LiveMeta from "../../components/common/LiveMeta";

function ReportCard({ title, value, color }) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white rounded-2xl p-5 shadow`}>
      <h3 className="text-sm opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

export default function Reports() {
  const { logout, user } = useAuth();
  const [packets, setPackets] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadReports = () => {
      getAllPackets(user.role, user.email)
        .then((data) => {
          setPackets(data);
          setLastUpdated(new Date());
          setError("");
        })
        .catch((err) => setError(err.message || "Unable to load reports"));
    };

    loadReports();
    const timer = setInterval(loadReports, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const reports = useMemo(() => {
    const count = (status) => packets.filter((packet) => packet.status === status).length;
    return [
      { title: "Total Requests", value: packets.length, color: "from-indigo-500 to-blue-600" },
      { title: "Pending", value: count("pending"), color: "from-yellow-400 to-orange-500" },
      { title: "Approved", value: count("approved"), color: "from-green-500 to-emerald-600" },
      { title: "Rejected", value: count("rejected"), color: "from-rose-500 to-red-600" },
    ];
  }, [packets]);

  return (
    <Layout
      title="Reports"
      subtitle="Track packet statistics and progress"
      onLogout={logout}
    >
      {error && <p className="mb-4 text-rose-600">{error}</p>}
      <div className="mb-4"><LiveMeta lastUpdated={lastUpdated} /></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((item) => (
          <ReportCard
            key={item.title}
            title={item.title}
            value={item.value}
            color={item.color}
          />
        ))}
      </div>

      <div className="mt-6 card">
        <h3 className="text-lg font-semibold text-slate-800">Approval Progress</h3>
        <div className="mt-4 space-y-4">
          {reports.slice(1).map((item) => {
            const percent = packets.length ? Math.round((item.value / packets.length) * 100) : 0;
            return (
              <div key={item.title}>
                <div className="mb-1 flex justify-between text-sm text-slate-600">
                  <span>{item.title}</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
