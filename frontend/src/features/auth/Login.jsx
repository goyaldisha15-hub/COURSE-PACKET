import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getRedirectPath = (role) => {
  if (role === "admin") return "/admin";
  if (role === "faculty") return "/faculty";
  return "/student";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(getRedirectPath(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      await login({ email, password, role });
      navigate(getRedirectPath(role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md card">
        <h1 className="text-3xl font-bold text-center text-indigo-600">
          Course Packet Login
        </h1>

        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-slate-700">Role</label>
          <select
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="mt-4 text-sm text-rose-600">{error}</div>
        )}

        <button type="submit" className="mt-6 w-full btn-primary">
          Login
        </button>
      </form>

      <div className="mt-4 text-center">
        <span className="text-sm text-slate-500">New user? </span>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-indigo-600 hover:underline text-sm font-semibold"
        >
          Register here
        </button>
      </div>
    </div>
  );
}