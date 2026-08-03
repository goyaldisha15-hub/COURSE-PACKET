import { useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { submitPacketRequest } from "../../services/packetService";
import { useToast } from "../../components/common/Toast";

export default function RequestPacket() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
    reason: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setAttachment(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {

      await submitPacketRequest({
        title: form.name + " - Request",
        course: form.course,
        description: form.reason,
      }, "faculty", user?.email || form.email);
      
      toast.success("Packet request submitted successfully!");
      setForm({ name: "", email: "", course: "", reason: "" });
      setAttachment(null);
    } catch (err) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Request Packet"
      subtitle="Fill the form to request a course packet"
      onLogout={logout}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">New Packet Request</h3>
              <p className="text-sm text-slate-500">Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Student Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Course</label>
              <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter course name"
                required
              />
            </div>

            <div>
              <label className="form-label">Reason</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                className="form-textarea min-h-32"
                placeholder="Write your reason for requesting this packet..."
                required
              />
            </div>

            <div>
              <label className="form-label">Attachment (optional)</label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFile}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 transition-colors cursor-pointer"
                />
                {attachment && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="font-medium">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="ml-auto text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary btn-lg w-full sm:w-auto"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Submit Request
                </span>
              )}
            </button>
          </form>
        </div>

        {}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-100">
            <h4 className="font-semibold text-primary-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instructions
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-primary-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                Fill in all required fields marked with *
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                Provide a clear reason for your request
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                You can attach supporting documents
              </li>
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What happens next?
            </h4>
            <ol className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span>Faculty reviews your request</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span>Admin approves the packet</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                <span>You get access to the content</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}
