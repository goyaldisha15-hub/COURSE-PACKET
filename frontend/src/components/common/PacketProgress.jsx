const steps = ["pending", "approved", "rejected"];

function getProgress(status) {
  if (status === "approved" || status === "rejected") return 100;
  return 45;
}

export function StatusPill({ status }) {
  const color =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "rejected"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";

  return <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${color}`}>{status}</span>;
}

export default function PacketProgress({ status = "pending" }) {
  const currentStatus = status || "pending";
  const progress = getProgress(currentStatus);

  return (
    <div className="min-w-48">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${currentStatus === "rejected" ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        {steps.map((step) => (
          <span key={step} className={step === currentStatus ? "font-semibold text-slate-800" : ""}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
