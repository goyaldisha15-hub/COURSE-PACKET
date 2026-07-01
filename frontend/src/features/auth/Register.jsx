import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const sectionOptions = ["AI/ML", "FSD", "DS", "Cyber"];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [section, setSection] = useState(sectionOptions[0]);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register({ name, email, role, password, section: role === "student" ? section : null });
      setSuccess("Registration successful. Please login to continue.");
      setError(null);
      navigate("/login", { replace: true });
    } catch (err) {
      setSuccess(null);
      setError(err.message || "Unable to register user.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md card">
        <h1 className="text-3xl font-bold text-center text-indigo-600">
          Register New User
        </h1>

        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
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

        {role === "student" && (
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium text-slate-700">Section</label>
            <select
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              {sectionOptions.map((sectionOption) => (
                <option key={sectionOption} value={sectionOption}>
                  {sectionOption}
                </option>
              ))}
            </select>
          </div>
        )}

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

        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium text-slate-700">Confirm Password</label>
          <input
            type="password"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="mt-4 text-sm text-rose-600">{error}</div>
        )}
        {success && (
          <div className="mt-4 text-sm text-emerald-600">{success}</div>
        )}

        <button type="submit" className="mt-6 w-full btn-primary">
          Register
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 w-full btn-secondary"
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}
