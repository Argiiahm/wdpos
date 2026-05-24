import { ShoppingCart } from "lucide-react";
import ListOrder from "./ListOrder";

const OrderLists = () => {
  return (
    <div className="flex h-screen flex-col border border-zinc-100 p-4">
      <div className="mb-6">
        <h1 className="text-right font-semibold">Order Lists</h1>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        <ListOrder menuName="Mie ayam" Qty="1" SubTotal="10.000" />
        <ListOrder menuName="Mie ayam" Qty="1" SubTotal="10.000" />
        <ListOrder menuName="Mie ayam" Qty="1" SubTotal="10.000" />
        <ListOrder menuName="Mie ayam" Qty="1" SubTotal="10.000" />
      </div>

      {/* checkout */}
      <div className="border-t border-gray-100 pt-4 bg-white">
        <div className="flex items-center justify-between">
          <span>6 items</span>
          <div className="flex items-center gap-1">
            <span className="text-zinc-400">subtotal:</span>
            <span className="font-semibold">Rp.200.000</span>
          </div>
        </div>

        <button className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 bg-zinc-500 py-3 text-white transition duration-300 ease-in-out hover:bg-green-600">
          <ShoppingCart />
          <span>Pesan sekarang</span>
        </button>
      </div>
    </div>
  );
};

export default OrderLists;
