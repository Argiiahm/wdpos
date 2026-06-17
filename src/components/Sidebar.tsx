import { useEffect, useState } from "react";
import { MoreVertical, LogOut, Store, Sun, Moon } from "lucide-react";
import MenuList from "./MenuList";
import { supabase } from "../lib/supabase/client";
import { useNavigate } from "react-router";

const Sidebar = () => {
  const [email, setEmail] = useState<string>("cashier@gmail.com");
  const [name, setName] = useState<string>("Cashier");
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "dark";
  });
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "");
        const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "Cashier";
        setName(displayName);
      }
    });
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <section className="h-full w-full flex flex-col p-4 text-gray-700 dark:text-zinc-300 bg-white dark:bg-black justify-between">
      <div className="flex flex-1 flex-col gap-1 p-2">
        <div className="flex-1">
          <div className="hidden lg:flex items-center gap-2 mb-6 px-1">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Store className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-zinc-100">SimplePos</span>
          </div>

          <div className="border-l border-gray-200 dark:border-zinc-800 pl-4 flex flex-col gap-3">
            <MenuList label="Dashboard" to="/" />
            <MenuList label="Menu" to="/Menu" />
            <MenuList label="Cashier" to="/cashier" />
            <MenuList label="Products" to="/products" />
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-auto border-t border-gray-200 dark:border-zinc-800 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold uppercase shrink-0">
              {name.charAt(0)}
            </div>

            <div className="flex flex-col text-sm min-w-0">
              <span className="font-semibold truncate text-slate-800 dark:text-zinc-200">{name}</span>
              <span className="text-gray-400 dark:text-zinc-500 text-xs truncate">{email}</span>
            </div>
          </div>

          <div className="relative flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              <MoreVertical size={20} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl py-1 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left cursor-pointer font-medium"
                  >
                    <LogOut size={16} />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;
