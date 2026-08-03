const steps = ["pending", "approved", "rejected"];

function getProgress(status) {
  if (status === "approved" || status === "rejected") return 100;
  return 45;
}

export function StatusPill({ status }) {
  const cls =
    status === "approved"
      ? "badge-approved"
      : status === "rejected"
      ? "badge-rejected"
      : "badge-pending";

  return (
    <span className={`${cls} capitalize`}>
      {status}
    </span>
  );
}

export default function PacketProgress({ status = "pending" }) {
  const currentStatus = status || "pending";
  const progress = getProgress(currentStatus);
  const barColor = currentStatus === "rejected" ? "bg-rose-500" : "bg-emerald-500";

  return (
    <div className="min-w-40">
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        {steps.map((step) => {
          const isActive = step === currentStatus;
          const isCompleted = currentStatus === "approved" && step === "pending";
          return (
            <span
              key={step}
              className={`capitalize transition-colors duration-300 ${
                isActive
                  ? "font-bold text-slate-800"
                  : isCompleted
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              {step === "approved" && currentStatus === "approved" ? (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {step}
                </span>
              ) : step === "rejected" && currentStatus === "rejected" ? (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {step}
                </span>
              ) : (
                step
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
