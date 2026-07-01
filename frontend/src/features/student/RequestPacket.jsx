import { useState } from "react";
import Layout from "../../components/layout/Layout";

export default function RequestPacket() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
    reason: "",
  });
  const [attachment, setAttachment] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setAttachment(file || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Request sent:", { ...form, attachment: attachment?.name });
    setForm({ name: "", email: "", course: "", reason: "" });
    setAttachment(null);
  };

  const handleLogout = () => {
    console.log("logout");
  };

  return (
    <Layout
      title="Request Packet"
      subtitle="Fill the form to request a course packet"
      onLogout={handleLogout}
    >
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Student Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Course
            </label>
            <input
              type="text"
              name="course"
              value={form.course}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter course name"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Reason
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-28"
              placeholder="Write reason..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">Attachment (optional)</label>
            <input type="file" onChange={handleFile} />
            {attachment && <p className="text-sm mt-2">Attached: {attachment.name}</p>}
          </div>

          <button type="submit" className="btn-primary">
            Submit Request
          </button>
        </form>
      </div>
    </Layout>
  );
}