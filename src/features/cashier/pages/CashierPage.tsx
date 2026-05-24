import { Clock, Receipt } from "lucide-react";

const CashierPage = () => {
  return (
    <section className="flex flex-wrap items-center gap-4">
      {/* card pesanan */}
      <div className="border-2 border-zinc-100 p-4 w-full max-w-80 hover:border-zinc-200 cursor-pointer">
        {/* header */}
        <div className="flex items-center gap-2 text-zinc-400 mb-3">
          <Receipt />
          <h1>PES-12:00</h1>
        </div>
        {/* Card Menu Opsi */}
        <div className="mb-4 border-b border-zinc-200 pb-3">
          <span className="font-semibold">Nasi goreng</span>
          <ul className="text-zinc-400 text-[14px] list-disc pl-6">
            <li>Original 2x - pedas & sedang</li>
            <li>Toping Bakso 1x - pedas</li>
          </ul>
        </div>
        <div className="mb-4 border-b border-zinc-200 pb-3">
          <span className="font-semibold">Bakso</span>
          <ul className="text-zinc-400 text-[14px] list-disc pl-6">
            <li>Original 2x - pedas & sedang</li>
            <li>Babat 1x - pedas</li>
          </ul>
        </div>
        <div className="mb-4 border-b border-zinc-200 pb-3">
          <span className="font-semibold">Jus Mangga</span>
          <ul className="text-zinc-400 text-[14px] list-disc pl-6"></ul>
        </div>

        {/* total price */}
        <div className="flex items-center gap-2 my-1">
          <span>Subtotal :</span>
          <span className="font-semibold">Rp. 120.000</span>
        </div>

        {/* footer */}
        <div className="flex items-center gap-1 text-zinc-400">
          <Clock size={14} color="green" />
          <span className="text-[14px]">Pesanan pukul: 12.00</span>
        </div>
      </div>
    </section>
  );
};

export default CashierPage;
