import { Minus, Plus, X } from "lucide-react";
import type { CartItem } from "../types";

type ListOrderProps = {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
};

const ListOrder = ({ item, onRemove, onUpdateQty }: ListOrderProps) => {
  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID").format(p);
  const subtotal = item.basePrice * item.qty;

  return (
    <div className="border-b border-gray-200 pb-3">
      {/* Header row */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm block truncate">
            {item.productName}
          </span>
          <span className="text-xs text-zinc-400">{item.variantName}</span>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-zinc-300 hover:text-red-500 cursor-pointer transition shrink-0 p-0.5"
        >
          <X size={16} />
        </button>
      </div>

      {/* Options */}
      {item.options.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {item.options.map((opt, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-zinc-100 text-zinc-500 rounded px-1.5 py-0.5 font-mono"
            >
              {opt.valueName}
              {opt.extraPrice > 0 && ` +${formatPrice(opt.extraPrice)}`}
            </span>
          ))}
        </div>
      )}

      {/* Qty + Subtotal */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
            className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-100"
          >
            <Minus size={12} />
          </button>
          <span className="text-sm font-medium w-5 text-center font-mono">
            {item.qty}
          </span>
          <button
            onClick={() => onUpdateQty(item.id, item.qty + 1)}
            className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-100"
          >
            <Plus size={12} />
          </button>
        </div>
        <span className="text-sm font-medium font-mono">
          Rp {formatPrice(subtotal)}
        </span>
      </div>
    </div>
  );
};

export default ListOrder;
