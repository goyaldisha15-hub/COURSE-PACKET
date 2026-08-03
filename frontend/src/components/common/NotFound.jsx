import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-primary-50 to-slate-100 px-4">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-6">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-slate-800 mb-2">404</h1>
        <p className="text-xl text-slate-500 mb-2">Page Not Found</p>
        <p className="text-slate-400 mb-6">The page you are looking for does not exist.</p>
        <button onClick={() => navigate("/login")} className="btn-primary">
          Go to Login
        </button>
      </div>
    </div>
  );
}
