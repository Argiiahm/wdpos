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
        return (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onDelete(order)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50 transition w-full"
            >
              <Trash2 size={14} />
              Hapus
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`border-2 rounded-xl p-4 w-full max-w-80 transition ${
        order.status === "done"
          ? "border-green-200 bg-green-50/30"
          : order.status === "cancelled"
            ? "border-red-100 bg-red-50/20 opacity-60"
            : order.status === "processing"
              ? "border-blue-200 bg-blue-50/20"
              : "border-zinc-100 hover:border-zinc-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-zinc-500">
          <Receipt size={18} />
          <span className="text-sm font-medium">
            PES-{formatTime(order.created_at)}
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Order Items */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {order.order_items.map((item) => (
          <div key={item.id} className="border-b border-zinc-100 pb-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{item.product_name}</span>
              <span className="text-xs text-zinc-400">{item.qty}x</span>
            </div>
            {item.variant_name && (
              <span className="text-xs text-zinc-400">{item.variant_name}</span>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100">
        <span className="text-sm text-zinc-500">Subtotal</span>
        <span className="font-semibold text-sm">
          Rp {formatPrice(order.total_price)}
        </span>
      </div>

      {/* Footer - Time */}
      <div className="flex items-center gap-1 text-zinc-400 mt-2">
        <Clock size={12} className="text-green-500" />
        <span className="text-xs">
          {formatDate(order.created_at)} • {formatTime(order.created_at)}
        </span>
      </div>

      {/* Actions */}
      {getActions()}
    </div>
  );
};

export default OrderCard;
