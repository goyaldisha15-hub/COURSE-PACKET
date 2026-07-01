import { useState } from "react";
import Layout from "../../components/layout/Layout";

const initialStatusData = [
  {
    id: 1,
    packet: "Packet A",
    status: "Pending",
    date: "18 June 2026",
  },
  {
    id: 2,
    packet: "Packet B",
    status: "Approved",
    date: "17 June 2026",
  },
  {
    id: 3,
    packet: "Packet C",
    status: "Rejected",
    date: "16 June 2026",
  },
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

export default function TrackStatus() {
  const [statusData, setStatusData] = useState(initialStatusData);

  const handleLogout = () => {
    console.log("logout");
  };

  const cancelRequest = (id) => {
    setStatusData((cur) => cur.map((it) => (it.id === id ? { ...it, status: "Cancelled" } : it)));
  };

  return (
    <Layout
      title="Track Status"
      subtitle="Check your packet request progress"
      onLogout={handleLogout}
    >
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Request History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">ID</th>
                <th className="p-3">Packet</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {statusData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.packet}</td>
                  <td className="p-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-3">{item.date}</td>
                  <td className="p-3">
                    {item.status !== "Cancelled" && (
                      <button onClick={() => cancelRequest(item.id)} className="btn-secondary">Cancel</button>
                    )}
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