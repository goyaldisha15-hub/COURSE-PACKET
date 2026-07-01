import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header({ title, subtitle, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
    }
    logout();
    navigate("/login", { replace: true });
  };

  const showBack = location.pathname !== "/login";

  return (
    <header className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            Back
          </button>
        )}

        <div>
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition"
      >
        Logout
      </button>
    </header>
  );
}