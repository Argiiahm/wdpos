import { X } from "lucide-react";

type OrderList = {
  menuName: string;
  Qty: string;
  SubTotal: string;
};

const ListOrder = ({ menuName, Qty, SubTotal }: OrderList) => {
  return (
    <div className="flex text-center justify-between gap-4 border-b border-zinc-200 pb-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{menuName}</span>
        <span className="text-zinc-400">{Qty}x</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Rp. {SubTotal}</span>
        <button className="text-zinc-300 cursor-pointer">
          <X />
        </button>
      </div>
    </div>
  );
};

export default ListOrder;
