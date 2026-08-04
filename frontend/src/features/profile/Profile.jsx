import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile, changePassword, uploadProfilePhoto } from "../../services/authService";
import Layout from "../../components/layout/Layout";
import { useToast } from "../../components/common/Toast";

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    department: "",
    phone: "",
    registrationNo: "",
    aboutMe: "",
    section: "",
  });


  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const loadProfile = async () => {
    if (!user?.email || !user?.role) return;
    setLoading(true);
    try {
      const data = await getProfile(user.role, user.email);
      setProfile(data);
      setForm({
        name: data.name || "",
        department: data.department || "",
        phone: data.phone || "",
        registrationNo: data.registrationNo || "",
        aboutMe: data.aboutMe || "",
        section: data.section || "",
      });
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfile(user.role, user.email, form);
      setProfile(updated);
      setEditing(false);
      toast.success("Profile updated successfully!");
      refreshProfile();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const updated = await uploadProfilePhoto(user.role, user.email, file);
      setProfile(updated);
      toast.success("Profile photo updated successfully!");
      refreshProfile();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Photo upload failed");
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdError("");

    if (!pwdForm.oldPassword || !pwdForm.newPassword) {
      setPwdError("Please fill all fields");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords do not match");
      return;
    }

    setPwdLoading(true);
    try {
      const result = await changePassword(user.role, user.email, pwdForm.oldPassword, pwdForm.newPassword);
      if (result.success) {
        toast.success("Password changed successfully!");
        setShowChangePwd(false);
        setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPwdError(result.message);
      }
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Profile" subtitle="Loading profile..." onLogout={logout}>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile" subtitle="View and manage your profile" onLogout={logout}>
      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {}
        <div className="card text-center animate-fade-in">
          {}
          <div className="relative w-24 h-24 mx-auto">
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
                {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>
        <div className="lg:col-span-2 card animate-fade-in">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Edit Profile</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <input type="text" name="department" value={form.department} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Registration No.</label>
                  <input type="text" name="registrationNo" value={form.registrationNo} onChange={handleChange} className="form-input" />
                </div>
                {profile?.role === "student" || profile?.role === "faculty" ? (
                  <div>
                    <label className="form-label">Section</label>
                    <input type="text" name="section" value={form.section} onChange={handleChange} className="form-input" />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="form-label">About Me</label>
                <textarea name="aboutMe" value={form.aboutMe} onChange={handleChange} className="form-textarea min-h-24" placeholder="Write something about yourself..." />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">Profile Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">Name</p>
                  <p className="mt-1 text-slate-700 font-medium">{profile?.name || "Not set"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">Email</p>
                  <p className="mt-1 text-slate-700">{profile?.email}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">Department</p>
                  <p className="mt-1 text-slate-700">{profile?.department || "Not set"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">Phone</p>
                  <p className="mt-1 text-slate-700">{profile?.phone || "Not set"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">Registration No.</p>
                  <p className="mt-1 text-slate-700">{profile?.registrationNo || "Not set"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">Role</p>
                  <p className="mt-1 text-slate-700 capitalize">{profile?.role}</p>
                </div>
                {profile?.section && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">Section</p>
                    <p className="mt-1 text-slate-700">{profile.section}</p>
                  </div>
                )}
              </div>
              {profile?.aboutMe && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">About Me</p>
                  <p className="mt-1 text-slate-700">{profile.aboutMe}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {}
      {showChangePwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowChangePwd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Change Password</h3>

            {pwdError && (
              <div className="mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePwdSubmit} className="space-y-4">
              <div>
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={pwdForm.oldPassword} onChange={(e) => setPwdForm({...pwdForm, oldPassword: e.target.value})} required />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={pwdForm.newPassword} onChange={(e) => setPwdForm({...pwdForm, newPassword: e.target.value})} required />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({...pwdForm, confirmPassword: e.target.value})} required />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={pwdLoading} className="btn-primary flex-1">
                  {pwdLoading ? "Changing..." : "Change Password"}
                </button>
                <button type="button" onClick={() => setShowChangePwd(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
