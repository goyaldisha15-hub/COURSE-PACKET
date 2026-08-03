import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";
import { getUsers, registerUser, adminUpdateUser, adminDeleteUser } from "../../services/authService";
import { TableSkeleton } from "../../components/common/Skeleton";
import { useToast } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";

const sectionOptions = ["AI/ML", "FSD", "DS", "Cyber"];

function RoleBadge({ role }) {
  const cls =
    role === "admin"
      ? "badge-approved"
      : role === "faculty"
      ? "badge-pending"
      : "bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full text-xs font-medium";

  return <span className={cls}>{role}</span>;
}

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

    if (!formData.name.trim()) { setError("Name is required"); return; }
    if (!formData.email.trim()) { setError("Email is required"); return; }
    if (!formData.password) { setError("Password is required"); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    if (formData.role === "student" && !formData.section) { setError("Section is required for students"); return; }

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Add New User</h2>
              <p className="text-sm text-slate-500">Fill in the details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" className="form-input" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" className="form-input" />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="form-select">
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>
          {formData.role === "student" && (
            <div>
              <label className="form-label">Section</label>
              <select name="section" value={formData.section} onChange={handleChange} className="form-select">
                {sectionOptions.map((sec) => (<option key={sec} value={sec}>{sec}</option>))}
              </select>
            </div>
          )}
          {formData.role === "faculty" && (
            <div>
              <label className="form-label">Section (Optional)</label>
              <select name="section" value={formData.section} onChange={handleChange} className="form-select">
                <option value="">Select Section</option>
                {sectionOptions.map((sec) => (<option key={sec} value={sec}>{sec}</option>))}
              </select>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="form-input" />
            </div>
            <div>
              <label className="form-label">Confirm</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm" className="form-input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
              ) : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ isOpen, onClose, user, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    section: "",
    department: "",
    phone: "",
    registrationNo: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "student",
        section: user.section || "",
        department: user.department || "",
        phone: user.phone || "",
        registrationNo: user.registrationNo || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) { setError("Name is required"); return; }
    try {
      await onSubmit(user.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Edit User</h2>
        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="form-select">
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <label className="form-label">Section</label>
            <input type="text" name="section" value={formData.section} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} className="form-input" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Registration No.</label>
              <input type="text" name="registrationNo" value={formData.registrationNo} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const { user: authUser, logout } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");


  const [editingUser, setEditingUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!authUser?.email || !authUser?.role) return;

    getUsers(authUser.role, authUser.email)
      .then((data) => {
        setUsers(data);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Failed to load users");
        toast.error("Failed to load users");
      })
      .finally(() => setUsersLoading(false));
  }, [authUser]);

  const handleAddUser = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const newUser = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        section: formData.role === "student" || formData.role === "faculty" ? formData.section : null,
      });
      setUsers((prev) => [...prev, newUser]);
      setIsModalOpen(false);
      toast.success("User added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userId, formData) => {
    setEditLoading(true);
    try {
      const updated = await adminUpdateUser(authUser.role, authUser.email, userId, formData);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success("User updated successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminDeleteUser(authUser.role, authUser.email, deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`User "${deleteTarget.name}" deleted successfully!`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout title="Users" subtitle="Manage admin, faculty and student users" onLogout={logout}>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            User List
          </h3>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add User
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {usersLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : users.length === 0 ? (
          <div className="empty-state">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
            <p className="text-slate-500 font-medium">No users available</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50/80">
                  <th className="table-header">ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} className="table-row animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="table-cell font-medium text-slate-800">#{user.id}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-500">{user.email}</td>
                    <td className="table-cell"><RoleBadge role={user.role} /></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="btn-secondary btn-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="btn-danger btn-sm"
                          disabled={user.email === authUser?.email}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddUser} loading={loading} />
      <EditUserModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} user={editingUser} onSubmit={handleEditUser} loading={editLoading} />
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
        type="danger"
      />
    </Layout>
  );
}
