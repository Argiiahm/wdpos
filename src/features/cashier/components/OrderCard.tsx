import {
  CheckCircle,
  Clock,
  Loader2,
  Receipt,
  Share2,
  Trash2,
  XCircle,
} from "lucide-react";
import type { OrderFull, OrderStatus } from "../types";
import { ORDER_STATUSES } from "../types";
import { useState, useRef } from "react";
import PaymentModal from "./PaymentModal";
import { updateOrderStatus } from "../service";
import { toBlob } from "html-to-image";
import { useTheme } from "../../../providers/ThemeProvider";

type OrderCardProps = {
  order: OrderFull;
  onStatusChange: () => void;
  onDelete: (order: OrderFull) => void;
};

const OrderCard = ({ order, onStatusChange, onDelete }: OrderCardProps) => {
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  const handleShare = async () => {
    if (!shareRef.current || sharing) return;
    setSharing(true);
    try {
      // Wait for DOM to settle
      await new Promise((resolve) => setTimeout(resolve, 50));

      const blob = await toBlob(shareRef.current, {
        pixelRatio: 3, // Premium high-def resolution (no blur)
        backgroundColor: isDark ? "#09090b" : "#f1f5f9",
        width: 440,
        style: {
          transform: "scale(1)",
        },
      });

      if (!blob) throw new Error("Gagal mengambil gambar");

      const file = new File([blob], `invoice-PES-${formatTime(order.created_at).replace(".", "-")}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice PES-${formatTime(order.created_at)}`,
          text: `Detail pesanan WarungDadakan untuk PES-${formatTime(order.created_at)}`,
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-PES-${formatTime(order.created_at).replace(".", "-")}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Gagal membagikan:", err);
    } finally {
      setSharing(false);
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
              onClick={() => setIsPaymentOpen(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition"
            >
              <CheckCircle size={14} />
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
      ref={cardRef}
      className={`border rounded-xl p-4 w-full max-w-md mx-auto transition flex flex-col justify-between ${order.status === "done"
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
              onClick={handleShare}
              disabled={sharing}
              className="text-zinc-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg shrink-0"
              title="Bagikan"
            >
              {sharing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Share2 size={15} />
              )}
            </button>
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
        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
          {order.order_items.map((item) => (
            <div key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.product_name}</span>
                {!item.product_name.toLowerCase().includes("ongkir") && (
                  <div className="flex items-center shrink-0 mt-0.5">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium w-8">{item.qty}x</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono w-24 text-right">
                      Rp {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                )}
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
      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        order={order}
        onPaymentSuccess={onStatusChange}
      />

      {/* Hidden wrapper to prevent visual display while maintaining layout/size for capture */}
      <div style={{ position: "absolute", overflow: "hidden", width: 0, height: 0, pointerEvents: "none" }}>
        {/* Off-screen invoice for sharing */}
        <div
          ref={shareRef}
          style={{
            width: "440px",
            backgroundColor: isDark ? "#09090b" : "#f1f5f9",
            backgroundImage: isDark
              ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-weight='bold' font-size='9' fill='rgba(255,255,255,0.035)'%3ETRX%3C/text%3E%3C/svg%3E\")"
              : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-weight='bold' font-size='9' fill='rgba(15,23,42,0.025)'%3ETRX%3C/text%3E%3C/svg%3E\")",
            backgroundSize: "60px 30px",
          }}
          className="p-8 font-sans text-left animate-none flex flex-col items-center justify-center"
        >
          {/* Captured card - structurally and visually identical to the live card */}
          <div
            className={`border rounded-2xl p-6 w-full shadow-2xl transition flex flex-col justify-between ${isDark
              ? "bg-[#18181b] border-zinc-800 text-zinc-100"
              : "bg-white border-zinc-200/80 text-zinc-900 shadow-[0_20px_50px_rgba(15,23,42,0.05)]"
              }`}
          >
            <div>
              {/* Header - Redesigned to show date instead of status */}
              <div className={`flex items-start justify-between mb-4 pb-3 border-b ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
                <div>

                  <span className="text-sm font-extrabold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                    PES-{formatTime(order.created_at)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                    DATE / TIME
                  </span>
                  <span className="text-xs font-semibold font-mono text-zinc-700 dark:text-zinc-300">
                    {formatDate(order.created_at)} • {formatTime(order.created_at)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {order.order_items.map((item) => (
                  <div key={item.id} className={`border-b pb-2 ${isDark ? "border-zinc-800/40" : "border-zinc-100"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{item.product_name}</span>
                      {!item.product_name.toLowerCase().includes("ongkir") && (
                        <div className="flex items-center shrink-0 mt-0.5">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium w-8">{item.qty}x</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono w-24 text-right">
                            Rp {formatPrice(item.price * item.qty)}
                          </span>
                        </div>
                      )}
                    </div>
                    {item.variant_name && (
                      <span className="text-xs text-zinc-450 dark:text-zinc-500">{item.variant_name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Total */}
              <div className={`flex items-center justify-between mt-3 pt-2 border-t ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Subtotal</span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                  Rp {formatPrice(order.total_price)}
                </span>
              </div>

              {/* Footer - Time */}
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mt-2.5">
                <Clock size={12} className="text-green-500" />
                <span className="text-xs font-mono">
                  {formatDate(order.created_at)} • {formatTime(order.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
