import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";

const CashierLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar drawer automatically on route navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <img src="/image/wd.png" alt="Logo WarungDadakan" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
          <span className="font-bold text-lg text-slate-800 dark:text-zinc-100">WarungDadakan</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Backdrop (Mobile only) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-black transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:z-auto border-r border-gray-200 dark:border-zinc-800 flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Mobile Sidebar Close Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <img src="/image/wd.png" alt="Logo WarungDadakan" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
            <span className="font-bold text-lg text-slate-800 dark:text-zinc-100">WarungDadakan</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Sidebar />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default CashierLayout;
