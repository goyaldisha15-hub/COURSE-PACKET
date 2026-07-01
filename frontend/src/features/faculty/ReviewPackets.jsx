import { useState } from "react";
import Layout from "../../components/layout/Layout";

const initialPackets = [
  { id: 1, student: "Aman", title: "Packet A", status: "pending" },
  { id: 2, student: "Riya", title: "Packet B", status: "review" },
  { id: 3, student: "Karan", title: "Packet C", status: "approved" },
];

export default function ReviewPackets() {
  const [packets, setPackets] = useState(initialPackets);
  const [selected, setSelected] = useState([]);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulkMark = (status) => {
    setPackets((current) => current.map((p) => (selected.includes(p.id) ? { ...p, status } : p)));
    setSelected([]);
  };

  const exportCSV = () => {
    const rows = packets.map((p) => `${p.id},${p.student},${p.title},${p.status}`);
    const csv = ["id,student,packet,status", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculty_packets.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    console.log("logout");
  };

  return (
    <Layout
      title="Review Packets"
      subtitle="Check student packet requests"
      onLogout={handleLogout}
    >
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Packet List</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => bulkMark("review")} className="btn-primary">Mark Review</button>
            <button onClick={() => bulkMark("approved")} className="btn-secondary">Mark Approved</button>
            <button onClick={exportCSV} className="btn-secondary">Export</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">Select</th>
                <th className="p-3">ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Packet</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {packets.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="p-3"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /></td>
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.student}</td>
                  <td className="p-3">{item.title}</td>
                  <td className="p-3 capitalize">{item.status}</td>
                  <td className="p-3">
                    <button className="btn-primary">Open</button>
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