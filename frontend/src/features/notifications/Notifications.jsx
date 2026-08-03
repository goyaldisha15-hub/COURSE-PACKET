import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getAllPackets, getFacultyPackets, getPackets } from "../../services/packetService";
import { StatusPill } from "../../components/common/PacketProgress";
import LiveMeta from "../../components/common/LiveMeta";
import { ListSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";

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
  const toast = useToast();
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
        .catch((err) => {
          setError(err.message || "Unable to load notifications");
          toast.error("Failed to load notifications");
        })
        .finally(() => setLoading(false));
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 10000);
    return () => clearInterval(timer);
  }, [toast, user]);

  const notifications = buildNotifications(user?.role, packets);
  const visibleNotifications = notifications.filter((item) => statusFilter === "all" || item.status === statusFilter);
  const unreadCount = notifications.filter((item) => item.status === "pending").length;

  return (
    <Layout title="Notifications" subtitle={`${unreadCount} items need attention`} onLogout={logout}>
      <div className="card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h3 className="section-title">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="form-select text-sm py-2"
          >
            <option value="all">All notifications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="empty-state">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-slate-500 font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleNotifications.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between animate-fade-in p-3 rounded-xl hover:bg-slate-50/50 transition-colors"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.status === "pending" && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-slow flex-shrink-0" />
                    )}
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600 ml-4">{item.message}</p>
                  <p className="mt-1 text-xs text-slate-400 ml-4 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
