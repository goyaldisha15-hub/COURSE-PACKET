import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../../components/layout/Layout";
import { submitPacketRequest } from "../../../services/packetService";

export default function SubmitPacket() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ title: "", course: "", description: "" });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    try {
      const packet = await submitPacketRequest(form, user.role, user.email);
      setStatus(`Packet request submitted with id ${packet.id}.`);
      setForm({ title: "", course: "", description: "" });
    } catch (err) {
      setError(err.message || "Submission failed");
    }
  };

  return (
    <Layout title="Submit Packet" subtitle="Faculty can submit new course packet requests" onLogout={logout}>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Packet Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Service Packet for Networking"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Course Name</label>
            <input
              name="course"
              value={form.course}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Networking"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-28"
              placeholder="Describe the packet data and objectives..."
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Submit Packet Request</button>
            <button type="button" onClick={logout} className="btn-secondary">Logout</button>
          </div>

          {status && <p className="text-green-600">{status}</p>}
          {error && <p className="text-rose-600">{error}</p>}
        </form>
      </div>
    </Layout>
  );
}
