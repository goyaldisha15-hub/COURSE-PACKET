import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast";

const sections = ["AI/ML", "FSD", "DS", "Cyber"];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [section, setSection] = useState(sections[0]);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all required fields.");
      return;
    }
    if (password !== confirmPwd) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, role, password, section: role === "student" ? section : null });
      setSuccess("Registration successful! Redirecting to login...");
      toast.success("Registration successful!");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg = err?.message || (typeof err === "string" ? err : "Registration failed. Please try again.");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-600">PacketTrack</h1>
          <p className="text-sm text-gray-500">Create a new account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {role === "student" && (
              <div>
                <label className="form-label">Section</label>
                <select className="form-select" value={section} onChange={(e) => setSection(e.target.value)}>
                  {sections.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} className="form-input pr-14" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-gray-400 text-sm hover:text-gray-600">
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Confirm password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Please wait..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")} className="text-indigo-600 hover:underline font-medium">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
