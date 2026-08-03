import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";

export default function Header({ title, subtitle, onLogout, onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();


  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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

  const pathParts = location.pathname.split("/").filter(Boolean);

  return (
    <header className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 p-4 animate-fade-in">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Toggle Menu"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {}
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200"
              title="Go Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
          )}

          <div className="hidden sm:block w-px h-8 bg-slate-200" />

          {}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {}
        <div className="flex items-center gap-2 md:gap-3">
          {}
          <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dateStr}
          </span>

          <ThemeToggle />

          {}
          <button
            onClick={() => navigate("/notifications")}
            className="relative w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all duration-200"
            title="Notifications"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
              !
            </span>
          </button>

          {}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-medium shadow-sm hover:from-rose-600 hover:to-rose-700 hover:shadow-md active:scale-[0.98] transition-all duration-200"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {}
      {pathParts.length > 0 && location.pathname !== "/login" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <button
            onClick={() => {
              const role = user?.role || "student";
              navigate(`/${role}`);
            }}
            className="hover:text-primary-600 transition-colors"
          >
            Home
          </button>
          {pathParts.map((part, index) => {
            const path = "/" + pathParts.slice(0, index + 1).join("/");
            const isLast = index === pathParts.length - 1;
            return (
              <span key={path} className="flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isLast ? (
                  <span className="text-slate-600 font-medium capitalize">
                    {part.replace(/-/g, " ")}
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(path)}
                    className="hover:text-primary-600 transition-colors capitalize"
                  >
                    {part.replace(/-/g, " ")}
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}
    </header>
  );
}
