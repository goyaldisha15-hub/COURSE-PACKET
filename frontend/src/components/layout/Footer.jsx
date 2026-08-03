export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto px-4 md:px-8 py-4 border-t border-slate-200 bg-white/50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <p>
          &copy; {currentYear} <span className="font-medium text-slate-500">PacketTrack</span> - Course Packet Management System
        </p>
        <p className="flex items-center gap-2">
          <span>Built with</span>
          <span className="text-rose-400">&hearts;</span>
          <span>for college course management</span>
        </p>
      </div>
    </footer>
  );
}
