import { MoreVertical } from "lucide-react";
import MenuList from "./MenuList";

const Sidebar = () => {
  return (
    <section className="border-r border-gray-100 h-screen w-full max-w-[20rem] flex flex-col p-4 text-gray-700">
      <aside className="flex flex-1 flex-col min-w-[240px] gap-1 p-2">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 mb-4 uppercase">
            Cashier
          </p>

          <div className="border-l border-gray-200 pl-4 flex flex-col gap-3">
            <MenuList label="Dashboard" to="/" />
            <MenuList label="Menu" to="/Menu" />
            <MenuList label="Cashier" to="/cashier" />
            <MenuList label="Products" to="/products" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold uppercase">
              C
            </div>

            <div className="flex flex-col text-sm">
              <span className="font-semibold">Cashier</span>
              <span className="text-gray-500 text-xs">cashier@gmail.com</span>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={20} />
          </button>
        </div>
      </aside>
    </section>
  );
};

export default Sidebar;
