import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../../components/layout/Layout";
import { submitPacketRequest } from "../../../services/packetService";
import { getDepartments, getSubjectsByDepartment } from "../../../services/packetService";
import { useToast } from "../../../components/common/Toast";

export default function SubmitPacket() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    title: "",
    course: "",
    subjectCode: "",
    description: "",
    semester: "",
    department: "",
    section: "",
    academicYear: "2024-2025",
    packetType: "notes",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);


  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
  }, []);


  useEffect(() => {
    if (!form.department) {
      setSubjects([]);
      return;
    }

    getSubjectsByDepartment(form.department)
      .then(setSubjects)
      .catch(() => {});
  }, [form.department]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    

    if (name === "subjectCode") {
      const selectedSubject = subjects.find(s => s.code === value);
      if (selectedSubject) {
        setForm((prev) => ({
          ...prev,
          subjectCode: value,
          course: selectedSubject.name,
          semester: selectedSubject.semester,
        }));
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {

      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setPdfFile(file);
      setFileName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setStatus(null);


    if (!form.title || !form.course || !form.department || !form.section || !form.semester) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("course", form.course);
      formData.append("subjectCode", form.subjectCode);
      formData.append("description", form.description);
      formData.append("semester", form.semester);
      formData.append("department", form.department);
      formData.append("section", form.section);
      formData.append("academicYear", form.academicYear);
      formData.append("packetType", form.packetType);
      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      const packet = await submitPacketRequest(formData, user.role, user.email);
      setStatus(`Packet "${packet.title}" submitted successfully!`);
      toast.success("Packet submitted successfully!");
      

      setForm({
        title: "",
        course: "",
        subjectCode: "",
        description: "",
        semester: "",
        department: "",
        section: "",
        academicYear: "2024-2025",
        packetType: "notes",
      });
      setPdfFile(null);
      setFileName("");
    } catch (err) {
      setError(err.message || "Submission failed");
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const sections = ["A", "B", "C"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const packetTypes = [
    { value: "notes", label: "Notes" },
    { value: "assignment", label: "Assignment" },
    { value: "question-bank", label: "Question Bank" },
    { value: "lab-manual", label: "Lab Manual" },
    { value: "presentation", label: "Presentation" },
    { value: "syllabus", label: "Syllabus" },
  ];
  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];

  return (
    <Layout title="Submit Packet" subtitle="Upload a new course packet with PDF" onLogout={logout}>
      <div className="card max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {}
          <div>
            <label className="form-label">Packet Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Machine Learning Notes Unit 1"
              required
            />
          </div>

          {}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Department *</label>
              <select name="department" value={form.department} onChange={handleChange} className="form-select" required>
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.code}>{dept.name} ({dept.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Section *</label>
              <select name="section" value={form.section} onChange={handleChange} className="form-select" required>
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>

          {}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Subject *</label>
              <select name="subjectCode" value={form.subjectCode} onChange={handleChange} className="form-select" required>
                <option value="">Select Subject</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.code}>{subj.name} ({subj.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Subject Code</label>
              <input
                name="subjectCode"
                value={form.subjectCode}
                onChange={handleChange}
                className="form-input bg-slate-50"
                placeholder="Auto-filled"
                readOnly
              />
            </div>
          </div>

          {}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Semester *</label>
              <select name="semester" value={form.semester} onChange={handleChange} className="form-select" required>
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Academic Year</label>
              <select name="academicYear" value={form.academicYear} onChange={handleChange} className="form-select">
                {academicYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {}
          <div>
            <label className="form-label">Packet Type</label>
            <select name="packetType" value={form.packetType} onChange={handleChange} className="form-select">
              {packetTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {}
          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="form-textarea min-h-24"
              placeholder="Describe the packet content..."
            />
          </div>

          {}
          <div>
            <label className="form-label">Upload PDF *</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
              {fileName ? (
                <div className="space-y-2">
                  <svg className="w-10 h-10 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-700">{fileName}</p>
                  <p className="text-xs text-slate-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    type="button"
                    onClick={() => { setPdfFile(null); setFileName(""); }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="w-10 h-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-slate-500">
                    <span className="text-indigo-600 font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF only (max 10MB)</p>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                </div>
              )}
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload-input"
              />
              {!fileName && (
                <label htmlFor="pdf-upload-input" className="cursor-pointer">
                  <span className="mt-2 inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                    Select PDF File
                  </span>
                </label>
              )}
            </div>
          </div>

          {}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Submitting..." : "Submit Packet"}
            </button>
            <button type="button" onClick={logout} className="btn-secondary">Logout</button>
          </div>

          {status && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{status}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
