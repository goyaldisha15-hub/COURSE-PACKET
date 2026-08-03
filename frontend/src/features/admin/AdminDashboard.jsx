import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getAllPackets } from "../../services/packetService";
import { getUsers } from "../../services/authService";
import LiveMeta from "../../components/common/LiveMeta";
import { StatusPill } from "../../components/common/PacketProgress";
import { CardSkeleton, ListSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [packets, setPackets] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    if (!user?.email || !user?.role) return;

    const loadDashboard = () => {
      Promise.all([getAllPackets(user.role, user.email), getUsers(user.role, user.email)])
        .then(([packetData, userData]) => {
          setPackets(packetData);
          setUsersList(userData);
          setLastUpdated(new Date());
          setError(null);
        })
        .catch((err) => {
          setError(err.message || "Unable to load dashboard data");
          toast.error("Failed to load dashboard data");
        })
        .finally(() => setLoading(false));
    };

    loadDashboard();
    const timer = setInterval(loadDashboard, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const stats = {
    totalUsers: usersList.length,
    pending: packets.filter((packet) => packet.status === "pending").length,
    approved: packets.filter((packet) => packet.status === "approved").length,
    rejected: packets.filter((packet) => packet.status === "rejected").length,
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Pending Packets",
      value: stats.pending,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-rose-500 to-red-600",
    },
  ];

  const recentRequests = packets.slice(0, 5);
  const priorityPackets = packets.filter((packet) => packet.status === "pending").slice(-3).reverse();

  return (
    <Layout title="Admin Dashboard" subtitle={`${getGreeting()}, ${user?.email || "Admin"}`} onLogout={logout}>
      {}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-5 mb-5">
        {}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-md">
          <h2 className="text-xl md:text-2xl font-bold">{getGreeting()}! 👋</h2>
          <p className="text-indigo-100 text-sm mt-1">
            Welcome to the Course Packet Management System.
          </p>
          <p className="text-indigo-200 text-xs mt-3">
            You have <span className="font-semibold text-white">{stats.pending}</span> pending packets 
            and <span className="font-semibold text-white">{stats.totalUsers}</span> registered users.
          </p>
        </div>

        {}
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{user?.email || "Admin"}</p>
            <p className="text-xs text-slate-500 capitalize">Role: {user?.role || "admin"}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </p>
          </div>
        </div>
      </div>

      {}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((stat) => (
            <div key={stat.title} className="stat-card-simple">
              <div className="flex items-center justify-between">
                <span className="stat-label">{stat.title}</span>
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
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => navigate("/admin/approval")} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Approval</span>
        </button>
        <button onClick={() => navigate("/admin/users")} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
          </svg>
          <span>Users</span>
        </button>
        <button onClick={() => navigate("/admin/reports")} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Reports</span>
        </button>
        <button onClick={() => navigate("/admin/packets")} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Activity</span>
        </button>
      </div>

      {}
      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        {}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Recent Activity
            </h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>

          {loading ? (
            <ListSkeleton count={3} />
          ) : recentRequests.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No requests yet</p>
          ) : (
            <div className="space-y-1">
              {recentRequests.map((r, idx) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.title}</p>
                    <p className="text-xs text-slate-400">{r.facultyEmail}</p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Priority Queue
            </h3>
            <button onClick={() => navigate("/admin/approval")} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Review All →
            </button>
          </div>
          {loading ? (
            <ListSkeleton count={3} />
          ) : priorityPackets.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">All caught up!</p>
          ) : (
            <div className="space-y-2">
              {priorityPackets.map((packet, idx) => (
                <div key={packet.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{packet.title}</p>
                    <p className="text-xs text-slate-400">{packet.course}</p>
                  </div>
                  <StatusPill status={packet.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
