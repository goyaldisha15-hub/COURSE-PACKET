export default function LiveMeta({ lastUpdated }) {
  if (!lastUpdated) return null;
  
  const timeAgo = () => {
    const diff = new Date() - new Date(lastUpdated);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Live · {timeAgo()}
    </span>
  );
}
