import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { getReports } from "../../services/packetService";
import LiveMeta from "../../components/common/LiveMeta";
import { CardSkeleton, ListSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";

export default function Reports() {
  const { logout, user } = useAuth();
  const toast = useToast();
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email || !user?.role) return;
    loadReports();
  }, [user]);

  const loadReports = () => {
    getReports(user.role, user.email)
      .then((data) => {
        setReportData(data);
        setLastUpdated(new Date());
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Unable to load reports");
        toast.error("Failed to load report data");
      })
      .finally(() => setLoading(false));
  };

  const exportCSV = () => {
    if (!reportData) return;
    const rows = [
      "Category,Count",
      `Total Packets,${reportData.total}`,
      `Pending,${reportData.pending}`,
      `Approved,${reportData.approved}`,
      `Rejected,${reportData.rejected}`,
      "",
      "Department,Count",
      ...(reportData.byDepartment || []).map(d => `${d.department},${d.count}`),
      "",
      "Packet Type,Count",
      ...(reportData.byType || []).map(t => `${t.packetType},${t.count}`),
    ];
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  const reports = [
    { title: "Total Packets", value: reportData?.total || 0, color: "from-indigo-500 to-indigo-600" },
    { title: "Pending", value: reportData?.pending || 0, color: "from-amber-500 to-orange-500" },
    { title: "Approved", value: reportData?.approved || 0, color: "from-emerald-500 to-green-600" },
    { title: "Rejected", value: reportData?.rejected || 0, color: "from-rose-500 to-red-600" },
  ];

  return (
    <Layout title="Reports" subtitle="Track packet statistics and progress" onLogout={logout}>
      {error && (
        <div className="mb-3 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <LiveMeta lastUpdated={lastUpdated} />
            <button onClick={exportCSV} className="btn-secondary btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>

          {}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {reports.map((item) => (
              <div key={item.title} className="stat-card-simple">
                <span className="stat-label">{item.title}</span>
                <p className="stat-value">{item.value}</p>
              </div>
            ))}
          </div>

          {}
          {reportData && reportData.total > 0 && (
            <div className="mt-5 card">
              <h3 className="font-bold text-slate-800 mb-4">Approval Progress</h3>
              <div className="space-y-4">
                {reports.slice(1).map((item) => {
                  const percent = reportData.total ? Math.round((item.value / reportData.total) * 100) : 0;
                  const barColor =
                    item.title === "Pending" ? "bg-amber-500" :
                    item.title === "Approved" ? "bg-emerald-500" : "bg-rose-500";
                  return (
                    <div key={item.title}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{item.title}</span>
                        <span className="font-medium text-slate-800">{item.value} ({percent}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {}
          <div className="mt-5 grid lg:grid-cols-2 gap-5">
            {reportData?.byDepartment && reportData.byDepartment.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-slate-800 mb-3">Department-wise Uploads</h3>
                <div className="space-y-2">
                  {reportData.byDepartment.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <span className="text-sm text-slate-600">{item.department || "Unknown"}</span>
                      <span className="text-sm font-semibold text-slate-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportData?.byType && reportData.byType.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-slate-800 mb-3">Packet Type Distribution</h3>
                <div className="space-y-2">
                  {reportData.byType.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <span className="text-sm text-slate-600 capitalize">{item.packetType?.replace("-", " ")}</span>
                      <span className="text-sm font-semibold text-slate-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {}
          <div className="mt-5 grid lg:grid-cols-2 gap-5">
            {reportData?.mostDownloaded && reportData.mostDownloaded.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-slate-800 mb-3">Most Downloaded</h3>
                <div className="space-y-2">
                  {reportData.mostDownloaded.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{p.title}</p>
                        <p className="text-xs text-slate-400">{p.department}</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">{p.downloadCount || 0} downloads</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportData?.leastDownloaded && reportData.leastDownloaded.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-slate-800 mb-3">Least Downloaded</h3>
                <div className="space-y-2">
                  {reportData.leastDownloaded.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{p.title}</p>
                        <p className="text-xs text-slate-400">{p.department}</p>
                      </div>
                      <span className="text-sm font-semibold text-rose-600">{p.downloadCount || 0} downloads</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {}
          <div className="mt-5 grid lg:grid-cols-2 gap-5">
            {reportData?.bySemester && reportData.bySemester.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-slate-800 mb-3">Semester-wise Uploads</h3>
                <div className="space-y-2">
                  {reportData.bySemester.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Semester {item.semester || "N/A"}</span>
                      <span className="text-sm font-semibold text-slate-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportData?.bySection && reportData.bySection.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-slate-800 mb-3">Section-wise Uploads</h3>
                <div className="space-y-2">
                  {reportData.bySection.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <span className="text-sm text-slate-600">Section {item.section || "N/A"}</span>
                      <span className="text-sm font-semibold text-slate-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
