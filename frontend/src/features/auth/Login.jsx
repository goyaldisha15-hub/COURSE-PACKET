import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/common/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  const toast = useToast();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const path = user.role === "admin" ? "/admin" : user.role === "faculty" ? "/faculty" : "/student";
    navigate(path, { replace: true });
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      await login({ email, password, role, rememberMe: remember });
      toast.success("Login successful!");
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err?.message || (typeof err === "string" ? err : "Login failed. Please check your credentials.");
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
          <p className="text-sm text-gray-500">Course Packet Management</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">Welcome Back</h2>
          </div>

          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} className="form-input pr-14" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-gray-400 text-sm hover:text-gray-600">
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-gray-300" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-indigo-600 hover:underline">Forgot password?</button>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Please wait..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          New user?{" "}
          <button type="button" onClick={() => navigate("/register")} className="text-indigo-600 hover:underline font-medium">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
