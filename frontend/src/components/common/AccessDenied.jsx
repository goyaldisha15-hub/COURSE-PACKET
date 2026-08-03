import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getHomePath = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "faculty") return "/faculty";
    return "/student";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-primary-50 to-slate-100 px-4">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-6">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-2">You do not have permission to view this page.</p>
        <p className="text-sm text-slate-400 mb-6">Your role ({user?.role}) does not have access.</p>
        <button onClick={() => navigate(getHomePath())} className="btn-primary">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
