import {
  CheckCircle,
  Clock,
  Loader2,
  Receipt,
  Trash2,
  XCircle,
} from "lucide-react";
import type { OrderFull, OrderStatus } from "../types";
import { ORDER_STATUSES } from "../types";
import { updateOrderStatus } from "../service";
import { useState } from "react";

type OrderCardProps = {
  order: OrderFull;
  onStatusChange: () => void;
  onDelete: (order: OrderFull) => void;
};

const OrderCard = ({ order, onStatusChange, onDelete }: OrderCardProps) => {
  const [loading, setLoading] = useState(false);

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID").format(p);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const statusInfo =
    ORDER_STATUSES[order.status as OrderStatus] ?? ORDER_STATUSES.pending;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      onStatusChange();
    } catch {
      // silent fail, parent will re-fetch
    } finally {
      setLoading(false);
    }
  };

  // Determine next action based on current status
  const getActions = () => {
    switch (order.status) {
      case "pending":
        return (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleStatusChange("processing")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Clock size={14} />
              )}
              Proses
            </button>
            <button
              onClick={() => handleStatusChange("cancelled")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
            >
              <XCircle size={14} />
            </button>
          </div>
        );
      case "processing":
        return (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleStatusChange("done")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Selesai
            </button>
          </div>
        );
      case "done":
      case "cancelled":
      default:
        return null;
    }
  };

  return (
    <div
      className={`border rounded-xl p-4 w-full max-w-md mx-auto transition flex flex-col justify-between ${
        order.status === "done"
          ? "border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-950/10"
          : order.status === "cancelled"
            ? "border-red-100 dark:border-red-900/20 bg-red-50/20 dark:bg-red-950/10 opacity-60"
            : order.status === "processing"
              ? "border-blue-200 dark:border-blue-900/20 bg-blue-50/20 dark:bg-blue-950/10"
              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Receipt size={18} />
            <span className="text-sm font-medium font-mono">
              PES-{formatTime(order.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
            <button
              type="button"
              onClick={() => onDelete(order)}
              className="text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg shrink-0"
              title="Hapus"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {order.order_items.map((item) => (
            <div key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.product_name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">{item.qty}x</span>
              </div>
              {item.variant_name && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">{item.variant_name}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        {/* Total */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Subtotal</span>
          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
            Rp {formatPrice(order.total_price)}
          </span>
        </div>

        {/* Footer - Time */}
        <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 mt-2.5">
          <Clock size={12} className="text-green-500" />
          <span className="text-xs font-mono">
            {formatDate(order.created_at)} • {formatTime(order.created_at)}
          </span>
        </div>

        {/* Actions */}
        {getActions()}
      </div>
    </div>
  );
};

export default OrderCard;
