import { useState } from "react";
import { ToastContext } from "./useToast";
export { useToast } from "./useToast";

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function addToast(message, type = "info", duration = 4000) {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, duration);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }

  const toast = {
    success: (message) => addToast(message, "success"),
    error: (message) => addToast(message, "error"),
    info: (message) => addToast(message, "info"),
    warning: (message) => addToast(message, "warning"),
  };

  const typeStyles = {
    success: "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200",
    error: "bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-200",
    info: "bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-200",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-200",
  };

  const typeIcons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`${typeStyles[item.type]} text-white px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-slide-down cursor-pointer`}
            onClick={() => removeToast(item.id)}
          >
            {typeIcons[item.type]}
            <p className="text-sm font-medium flex-1">{item.message}</p>
            <button className="text-white/70 hover:text-white transition-colors" type="button">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
