import { useState } from "react";
import Layout from "../../components/layout/Layout";
import { useToast } from "../../components/common/Toast";

const initialRemarks = [
  { id: 1, student: "Aman", remark: "Check missing document." },
  { id: 2, student: "Riya", remark: "Approved after correction." },
];

export default function Remarks() {
  const toast = useToast();
  const [remarks, setRemarks] = useState(initialRemarks);
  const [student, setStudent] = useState("");
  const [remark, setRemark] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!student.trim() || !remark.trim()) {
      toast.warning("Please fill in both fields");
      return;
    }

    const newRemark = {
      id: Date.now(),
      student: student.trim(),
      remark: remark.trim(),
    };

    setRemarks([newRemark, ...remarks]);
    setStudent("");
    setRemark("");
    toast.success("Remark added successfully");
  };

  const handleLogout = () => {
    console.log("logout");
  };

  return (
    <Layout
      title="Remarks"
      subtitle="Add review notes for packets"
      onLogout={handleLogout}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {}
        <div className="card animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Add Remark</h3>
              <p className="text-sm text-slate-500">Write a note for a student</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Student Name</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className="form-input pl-11"
                  placeholder="Enter student name"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Remark</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="form-textarea min-h-28"
                placeholder="Write your remark..."
              />
            </div>

            <button type="submit" className="btn-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m10 4h-4m4 4h-4m4 4h-4M3 7l3-3m0 0l3 3M6 4v16" />
              </svg>
              Save Remark
            </button>
          </form>
        </div>

        {}
        <div className="card animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Recent Remarks</h3>
              <p className="text-sm text-slate-500">{remarks.length} total remarks</p>
            </div>
          </div>

          {remarks.length === 0 ? (
            <div className="empty-state">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 font-medium">No remarks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {remarks.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors duration-200 animate-fade-in border border-slate-100"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {item.student.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{item.student}</p>
                      <p className="text-slate-600 text-sm mt-0.5">{item.remark}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
