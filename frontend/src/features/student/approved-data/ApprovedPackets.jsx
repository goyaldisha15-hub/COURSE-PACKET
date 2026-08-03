import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../../components/layout/Layout";
import { getPackets, searchPackets, downloadPacket, addBookmark, removeBookmark, getBookmarks } from "../../../services/packetService";
import { getDepartments } from "../../../services/packetService";
import LiveMeta from "../../../components/common/LiveMeta";
import PacketDetailsModal from "../../../components/common/PacketDetailsModal";
import { TableSkeleton } from "../../../components/common/Skeleton";
import { useToast } from "../../../components/common/Toast";

function StatusBadge({ status }) {
  const cls =
    status === "approved"
      ? "badge-approved"
      : status === "rejected"
      ? "badge-rejected"
      : "badge-pending";
  return <span className={cls}>{status}</span>;
}

export default function ApprovedPackets() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activePacket, setActivePacket] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [departments, setDepartments] = useState([]);


  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("newest");


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadPackets = () => {
    getPackets(user.email, user.role)
      .then((data) => {
        setPackets(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unable to load approved packets");
        toast.error("Failed to load approved packets");
        setLoading(false);
      });
  };

  const loadBookmarks = () => {
    getBookmarks(user.role, user.email)
      .then((data) => {
        setBookmarkedIds(new Set(data.map((bookmark) => bookmark.packetId)));
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) return;

    loadPackets();
    loadBookmarks();
    getDepartments().then(setDepartments).catch(() => {});
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPackets();
      return;
    }
    setLoading(true);
    try {
      const results = await searchPackets({ q: searchQuery }, user.role, user.email);
      setPackets(results);
      setLastUpdated(new Date());
    } catch (err) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (packet) => {
    try {
      const blob = await downloadPacket(packet.id, user.role, user.email);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = packet.fileName || `${packet.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started");
      loadPackets(); // Refresh to update download count
    } catch (err) {
      toast.error(err.message || "Download failed");
    }
  };

  const handleBookmark = async (packetId) => {
    try {
      if (bookmarkedIds.has(packetId)) {
        await removeBookmark(packetId, user.role, user.email);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(packetId);
          return next;
        });
        toast.success("Bookmark removed");
      } else {
        await addBookmark(packetId, user.role, user.email);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.add(packetId);
          return next;
        });
        toast.success("Bookmark added");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };


  const filteredPackets = (() => {
    let result = [...packets];

    if (filterDepartment) {
      result = result.filter((p) => p.department === filterDepartment);
    }
    if (filterSemester) {
      result = result.filter((p) => p.semester === filterSemester);
    }
    if (filterType) {
      result = result.filter((p) => p.packetType === filterType);
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "za") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "most-downloaded") {
      result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    }

    return result;
  })();


  const totalPages = Math.ceil(filteredPackets.length / itemsPerPage);
  const paginatedPackets = filteredPackets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const packetTypes = [
    { value: "notes", label: "Notes" },
    { value: "assignment", label: "Assignment" },
    { value: "question-bank", label: "Question Bank" },
    { value: "lab-manual", label: "Lab Manual" },
    { value: "presentation", label: "Presentation" },
    { value: "syllabus", label: "Syllabus" },
  ];

  return (
    <Layout title="Approved Packets" subtitle="Browse and download approved course packets" onLogout={logout}>
      {}
      <div className="card mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          {}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by title, subject, faculty..."
                className="form-input pl-10"
              />
              <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button onClick={handleSearch} className="btn-primary btn-sm">Search</button>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <select value={filterDepartment} onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }} className="form-select text-sm">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.code}>{d.code}</option>)}
          </select>
          <select value={filterSemester} onChange={(e) => { setFilterSemester(e.target.value); setCurrentPage(1); }} className="form-select text-sm">
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="form-select text-sm">
            <option value="">All Types</option>
            {packetTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select text-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="most-downloaded">Most Downloaded</option>
          </select>
        </div>
      </div>

      {}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approved Packets ({filteredPackets.length})
            </h3>
            <LiveMeta lastUpdated={lastUpdated} />
          </div>
          <span className="badge-approved text-xs">Auto-filtered by your department & section</span>
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={8} />
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        ) : paginatedPackets.length === 0 ? (
          <div className="empty-state">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 font-medium">No approved packets available</p>
            <p className="text-sm text-slate-400 mt-1">Packets matching your department, section and semester will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50/80">
                    <th className="table-header">Title</th>
                    <th className="table-header">Subject</th>
                    <th className="table-header">Faculty</th>
                    <th className="table-header">Dept</th>
                    <th className="table-header">Sem</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Downloads</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPackets.map((packet, idx) => (
                    <tr key={packet.id} className="table-row animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                      <td className="table-cell font-medium text-slate-800">{packet.title}</td>
                      <td className="table-cell">{packet.course}</td>
                      <td className="table-cell text-sm">{packet.facultyEmail}</td>
                      <td className="table-cell text-sm">{packet.department}</td>
                      <td className="table-cell text-sm">{packet.semester}</td>
                      <td className="table-cell">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                          {packet.packetType?.replace("-", " ")}
                        </span>
                      </td>
                      <td className="table-cell text-sm">{packet.downloadCount || 0}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => setActivePacket(packet)} className="btn-outline btn-sm" title="View Details">
                            View
                          </button>
                          <button onClick={() => handleDownload(packet)} className="btn-primary btn-sm" title="Download PDF">
                            Download
                          </button>
                          <button
                            onClick={() => handleBookmark(packet.id)}
                            className={`btn-sm ${bookmarkedIds.has(packet.id) ? "btn-warning" : "btn-secondary"}`}
                            title={bookmarkedIds.has(packet.id) ? "Remove Bookmark" : "Add Bookmark"}
                          >
                            {bookmarkedIds.has(packet.id) ? "Bookmarked" : "Bookmark"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPackets.length)} of {filteredPackets.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary btn-sm"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn-sm ${currentPage === page ? "btn-primary" : "btn-secondary"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <PacketDetailsModal packet={activePacket} onClose={() => setActivePacket(null)} />
    </Layout>
  );
}
