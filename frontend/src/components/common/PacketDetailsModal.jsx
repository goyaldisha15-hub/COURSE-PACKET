import PacketProgress, { StatusPill } from "./PacketProgress";

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

export default function PacketDetailsModal({ packet, onClose }) {
  if (!packet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{packet.title}</h2>
            <p className="text-sm text-slate-500">{packet.course}</p>
          </div>
          <button onClick={onClose} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
            Close
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Status</p>
              <div className="mt-2"><StatusPill status={packet.status} /></div>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Faculty</p>
              <p className="mt-2 text-sm text-slate-700">{packet.facultyEmail || packet.submittedBy}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Submitted</p>
              <p className="mt-2 text-sm text-slate-700">{formatDate(packet.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Last Updated</p>
              <p className="mt-2 text-sm text-slate-700">{formatDate(packet.updatedAt)}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase text-slate-400">Progress</p>
            <PacketProgress status={packet.status} />
          </div>

          <div>
            <p className="text-xs uppercase text-slate-400">Description</p>
            <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              {packet.description || "No description added."}
            </p>
          </div>

          {packet.remarks && (
            <div>
              <p className="text-xs uppercase text-slate-400">Remarks</p>
              <p className="mt-2 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">{packet.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
