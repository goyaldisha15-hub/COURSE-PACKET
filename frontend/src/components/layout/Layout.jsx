import Sidebar from "./Sidebar";
import Header from "./Header";
import AiBot from "../common/AiBot";

export default function Layout({ title, subtitle, onLogout, children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8">
        <Header title={title} subtitle={subtitle} onLogout={onLogout} />
        <div className="mt-6">{children}</div>
      </main>
      <AiBot />
    </div>
  );
}
