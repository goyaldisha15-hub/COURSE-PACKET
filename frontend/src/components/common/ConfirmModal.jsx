export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", 
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const btnClass =
    type === "danger"
      ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700"
      : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            type === "danger" ? "bg-rose-100" : "bg-amber-100"
          }`}
        >
          <svg
            className={`w-8 h-8 ${type === "danger" ? "text-rose-500" : "text-amber-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {}
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>

        {}
        <p className="text-sm text-slate-500 mb-6">{message}</p>

        {}
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 ${btnClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
