import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getAllPackets, getFacultyPackets, getPackets } from "../../services/packetService";
import { StatusPill } from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";

function buildNotifications(role, packets) {
  if (role === "admin") {
    return packets.map((packet) => ({
      id: packet.id,
      title: packet.status === "pending" ? "New packet waiting for approval" : `Packet ${packet.status}`,
      message: `${packet.title} - ${packet.course} by ${packet.facultyEmail}`,
      status: packet.status,
      date: packet.createdAt,
    }));
  }

  if (role === "faculty") {
    return packets.map((packet) => ({
      id: packet.id,
      title: packet.status === "pending" ? "Packet is under review" : `Packet ${packet.status}`,
      message: `${packet.title} for ${packet.course}`,
      status: packet.status,
      date: packet.updatedAt || packet.createdAt,
    }));
  }

  return packets.map((packet) => ({
    id: packet.id,
    title: "Approved packet available",
    message: `${packet.title} for ${packet.course} is ready to view.`,
    status: packet.status,
    date: packet.updatedAt || packet.createdAt,
  }));
}

export default function Notifications() {
  const { logout, user } = useAuth();
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadNotifications = () => {
      const loader =
        user.role === "admin"
          ? getAllPackets(user.role, user.email)
          : user.role === "faculty"
          ? getFacultyPackets(user.role, user.email)
          : getPackets(user.email, user.role);

      loader
        .then((data) => {
          setPackets(data);
          setLastUpdated(new Date());
          setError("");
        })
        .catch((err) => setError(err.message || "Unable to load notifications"))
        .finally(() => setLoading(false));
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const notifications = useMemo(() => buildNotifications(user?.role, packets), [packets, user]);
  const visibleNotifications = useMemo(
    () => notifications.filter((item) => statusFilter === "all" || item.status === statusFilter),
    [notifications, statusFilter]
  );
  const unreadCount = notifications.filter((item) => item.status === "pending").length;

  return (
    <Layout title="Notifications" subtitle={`${unreadCount} items need attention`} onLogout={logout}>
      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <LiveMeta lastUpdated={lastUpdated} />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All notifications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading notifications...</p>
        ) : error ? (
          <p className="text-rose-600">{error}</p>
        ) : visibleNotifications.length === 0 ? (
          <p className="text-slate-600">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {visibleNotifications.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 border-b pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(item.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
