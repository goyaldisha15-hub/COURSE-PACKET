import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";

const initialPackets = [
  { id: 1, student: "Aman", packet: "Packet A", course: "Math", status: "Pending" },
  { id: 2, student: "Riya", packet: "Packet B", course: "Physics", status: "Pending" },
  { id: 3, student: "Karan", packet: "Packet C", course: "Chemistry", status: "Approved" },
];

function StatusBadge({ status }) {
  const color =
    status === "Approved"
      ? "bg-green-100 text-green-700"
      : status === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status}
    </span>
  );
}

export default function AdminPackets() {
  const { logout, user } = useAuth();
  const [packets, setPackets] = useState(initialPackets);
  const [selected, setSelected] = useState([]);

  const updateStatus = (id, status) => {
    setPackets((current) =>
      current.map((packet) => (packet.id === id ? { ...packet, status } : packet))
    );
    setSelected((s) => s.filter((x) => x !== id));
  };

  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectAll = (checked) => {
    setSelected(checked ? packets.map((p) => p.id) : []);
  };

  const bulkUpdate = (status) => {
    if (!selected.length) {
      alert("Please select at least one packet before applying bulk actions.");
      return;
    }

    setPackets((current) => current.map((p) => (selected.includes(p.id) ? { ...p, status } : p)));
    setSelected([]);
  };

  const exportCSV = () => {
    const exportPackets = selected.length ? packets.filter((p) => selected.includes(p.id)) : packets;
    if (!exportPackets.length) {
      alert("No packets available to export.");
      return;
    }

    const rows = exportPackets.map((p) => `${p.id},${p.student},${p.packet},${p.course},${p.status}`);
    const csv = ["id,student,packet,course,status", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packets.csv";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <Layout
      title="Approve Packets"
      subtitle={`Manage packet approvals, ${user?.email || "Admin"}`}
      onLogout={logout}
    >
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Pending Packet Requests</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => bulkUpdate("Approved")} className="btn-primary">Bulk Approve</button>
            <button onClick={() => bulkUpdate("Rejected")} className="btn-secondary">Bulk Reject</button>
            <button onClick={exportCSV} className="btn-secondary">Export CSV</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">
                  <input type="checkbox" onChange={(e) => selectAll(e.target.checked)} checked={selected.length === packets.length} />
                </th>
                <th className="p-3">ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Packet</th>
                <th className="p-3">Course</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {packets.map((packet) => (
                <tr key={packet.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(packet.id)} onChange={() => toggle(packet.id)} />
                  </td>
                  <td className="p-3">{packet.id}</td>
                  <td className="p-3">{packet.student}</td>
                  <td className="p-3">{packet.packet}</td>
                  <td className="p-3">{packet.course}</td>
                  <td className="p-3">
                    <StatusBadge status={packet.status} />
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => updateStatus(packet.id, "Approved")}
                      className="px-3 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(packet.id, "Rejected")}
                      className="px-3 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
