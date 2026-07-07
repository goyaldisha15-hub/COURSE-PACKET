import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import { getUsers, registerUser } from "../../services/authService";

const sectionOptions = ["AI/ML", "FSD", "DS", "Cyber"];

function AddUserModal({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    section: sectionOptions[0],
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.role === "student" && !formData.section) {
      setError("Section is required for students");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        section: sectionOptions[0],
      });
    } catch (err) {
      setError(err.message || "Failed to add user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Add New User</h2>

        {error && <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          {formData.role === "student" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sectionOptions.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.role === "faculty" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Section (Optional)</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Section</option>
                {sectionOptions.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const { user: authUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authUser?.email || !authUser?.role) return;

    getUsers(authUser.role, authUser.email)
      .then((data) => {
        setUsers(data);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setUsersLoading(false));
  }, [authUser]);

  const handleAddUser = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const newUser = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        section: formData.role === "student" || formData.role === "faculty" ? formData.section : null,
      });
      setUsers((prev) => [...prev, newUser]);
      setSuccess("User added successfully!");
      setIsModalOpen(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to add user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Users"
      subtitle="Manage admin, faculty and student users"
      onLogout={logout}
    >
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">User List</h3>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            Add User
          </button>
        </div>

        {success && <div className="mb-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg text-sm">{success}</div>}
        {error && <div className="mb-4 p-3 bg-rose-100 text-rose-700 rounded-lg text-sm">{error}</div>}

        {usersLoading ? (
          <p className="text-slate-600">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-slate-600">No users available.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddUser} loading={loading} />
    </Layout>
  );
}
