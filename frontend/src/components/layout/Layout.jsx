import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AiBot from "../common/AiBot";
import Footer from "./Footer";

export default function Layout({ title, subtitle, onLogout, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 bg-grid flex">
      {}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-slide-right">
            <Sidebar />
          </div>
        </div>
      )}

      {}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="p-4 md:p-8 pb-0">
          <Header
            title={title}
            subtitle={subtitle}
            onLogout={onLogout}
            onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
        </div>
        <div className="flex-1 p-4 md:p-8 pt-4 md:pt-6 animate-fade-in">
          {children}
        </div>
        {}
        <Footer />
      </main>
      <AiBot />
    </div>
  );
}
