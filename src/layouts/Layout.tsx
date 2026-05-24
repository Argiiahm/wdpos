import Sidebar from "../components/Sidebar";

const CashierLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="fixed left-0 top-0 h-screen w-64">
        <Sidebar />
      </div>
      <main className="ml-64 flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};

export default CashierLayout;
