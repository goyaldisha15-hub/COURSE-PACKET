import { useState } from "react";
import Layout from "../../components/layout/Layout";

const initialRemarks = [
  { id: 1, student: "Aman", remark: "Check missing document." },
  { id: 2, student: "Riya", remark: "Approved after correction." },
];

export default function Remarks() {
  const [remarks, setRemarks] = useState(initialRemarks);
  const [student, setStudent] = useState("");
  const [remark, setRemark] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRemark = {
      id: Date.now(),
      student,
      remark,
    };

    setRemarks([newRemark, ...remarks]);
    setStudent("");
    setRemark("");
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
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800">Add Remark</h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Student Name
              </label>
              <input
                type="text"
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Remark
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-28"
                placeholder="Write remark..."
              />
            </div>

            <button type="submit" className="btn-primary">
              Save Remark
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Remarks</h3>

          <div className="space-y-3">
            {remarks.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50">
                <p className="font-semibold text-slate-800">{item.student}</p>
                <p className="text-slate-600 text-sm mt-1">{item.remark}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}