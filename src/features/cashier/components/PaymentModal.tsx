import { AlertCircle, Banknote, CheckCircle, Loader2, QrCode, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { OrderFull } from "../types";
import { updateOrderStatus } from "../service";
import { getSetting } from "../../settings/service";
import { recordTransaction } from "../../finance/service";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: OrderFull | null;
  onPaymentSuccess: () => void;
};

const PaymentModal = ({ isOpen, onClose, order, onPaymentSuccess }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [cashPaid, setCashPaid] = useState<string>("" );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customQris, setCustomQris] = useState<string | null>(null);
  const [cashActive, setCashActive] = useState<boolean>(true);
  const [qrisActive, setQrisActive] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setCashPaid("");
      setError(null);
      
      // Load payment configurations
      Promise.all([
        getSetting("payment_cash_active"),
        getSetting("payment_qris_active"),
        getSetting("qris_image")
      ]).then(([cashVal, qrisVal, imageVal]) => {
        const isCash = cashVal === null ? true : cashVal === "true";
        const isQris = qrisVal === null ? true : qrisVal === "true";
        
        setCashActive(isCash);
        setQrisActive(isQris);
        setCustomQris(imageVal);
        
        // Auto-select active payment method
        if (!isCash && isQris) {
          setPaymentMethod("qris");
        } else {
          setPaymentMethod("cash");
        }
      });
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const totalPrice = order.total_price;
  const numericCashPaid = parseFloat(cashPaid.replace(/[^0-9]/g, "")) || 0;
  const change = Math.max(0, numericCashPaid - totalPrice);
  const isInsufficient = paymentMethod === "cash" && numericCashPaid < totalPrice;

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID").format(p);

  // Generate quick cash suggestions
  const getQuickCashSuggestions = () => {
    const suggestions = new Set<number>();
    suggestions.add(totalPrice);
    
    const banknotes = [10000, 20000, 50000, 100000];
    for (const note of banknotes) {
      if (note > totalPrice) suggestions.add(note);
    }
    
    return Array.from(suggestions)
      .filter((val) => val >= totalPrice)
      .sort((a, b) => a - b)
      .slice(0, 4); // Max 4 options for compact layout
  };

  const handleConfirmPayment = async () => {
    if (isInsufficient) {
      setError("Uang kurang dari total tagihan.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Record finance transaction (failsafe to local storage if DB table does not exist)
      try {
        await recordTransaction({
          orderId: order.id,
          amount: totalPrice,
          paymentMethod: paymentMethod,
          cashPaid: paymentMethod === "cash" ? numericCashPaid : 0,
          changeReturned: paymentMethod === "cash" ? change : 0,
        });
      } catch (fErr) {
        console.warn("Gagal menyimpan ke Supabase (tabel finance_transactions belum dibuat):", fErr);
        const localFinances = JSON.parse(localStorage.getItem("local_finance_transactions") || "[]");
        localFinances.push({
          id: `ft-${Date.now()}`,
          order_id: order.id,
          amount: totalPrice,
          payment_method: paymentMethod,
          cash_paid: paymentMethod === "cash" ? numericCashPaid : 0,
          change_returned: paymentMethod === "cash" ? change : 0,
          created_at: new Date().toISOString(),
          orders: {
            total_price: totalPrice,
            created_at: order.created_at,
            order_items: order.order_items.map((i) => ({
              product_name: i.product_name,
              qty: i.qty,
              price: i.price,
            })),
          },
        });
        localStorage.setItem("local_finance_transactions", JSON.stringify(localFinances));
      }

      // 2. Update status in database
      await updateOrderStatus(order.id, "done");
      onPaymentSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 transition-opacity animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pembayaran Pesanan
            </h3>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
              #{order.id.substring(0, 8).toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Total Price (Simple & Clean) */}
        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Tagihan</span>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
            Rp {formatPrice(totalPrice)}
          </span>
        </div>

        {/* Payment Method Selector (Compact Tabs) - Only render if both are active */}
        {cashActive && qrisActive && (
          <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-850 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                paymentMethod === "cash"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Banknote size={14} />
              Cash / Tunai
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("qris")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                paymentMethod === "qris"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <QrCode size={14} />
              QRIS Barcode
            </button>
          </div>
        )}

        {/* Small label if only one method is active */}
        {(!cashActive || !qrisActive) && (
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            {paymentMethod === "cash" ? (
              <>
                <Banknote size={12} className="text-emerald-500" />
                <span>Metode: Cash / Tunai</span>
              </>
            ) : (
              <>
                <QrCode size={12} className="text-blue-500" />
                <span>Metode: QRIS Barcode</span>
              </>
            )}
          </div>
        )}

        {/* Payment Inputs */}
        <div className="min-h-[170px] flex flex-col justify-center">
          {paymentMethod === "cash" ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 block mb-1">
                  Uang Dibayar (Tunai)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={cashPaid ? formatPrice(numericCashPaid) : ""}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                      setCashPaid(digitsOnly);
                    }}
                    placeholder="Masukkan jumlah..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold font-mono focus:outline-hidden focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {getQuickCashSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashPaid(suggestion.toString())}
                    className={`py-1 px-2.5 rounded-lg border text-[11px] font-semibold font-mono transition ${
                      numericCashPaid === suggestion
                        ? "border-zinc-800 bg-zinc-800 text-white"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {suggestion === totalPrice ? "Uang Pas" : formatPrice(suggestion)}
                  </button>
                ))}
              </div>

              {/* Change Widget */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/60 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Uang Kembalian</span>
                <span className={`font-bold font-mono text-sm ${change > 0 ? "text-green-600 dark:text-green-400" : "text-zinc-800 dark:text-zinc-250"}`}>
                  Rp {formatPrice(change)}
                </span>
              </div>
            </div>
          ) : (
            /* Compact QRIS QR Code */
            <div className="flex flex-col items-center justify-center py-2 animate-fade-in">
              <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col items-center">
                
                {/* Custom Image or Fallback Dummy QRIS */}
                <div className="relative p-2 bg-white flex flex-col items-center justify-center">
                  {customQris ? (
                    <img
                      src={customQris}
                      alt="QRIS Barcode"
                      className="w-[180px] h-[180px] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd943YrkK94lisw9XwLMr53tJFcGnd7OBP1cZO3z3Llg&s=10"
                        alt="QRIS Dummy"
                        className="w-[180px] h-[180px] object-contain rounded-lg"
                      />
                      <span className="text-[10px] text-red-500 font-extrabold mt-2 tracking-wide uppercase">
                        (QRIS Palsu / Simulasi)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-500">
                <Smartphone size={14} className="text-blue-500 animate-pulse" />
                <span>Tunjukkan barcode QRIS ke pelanggan</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-3">
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200/50">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-3 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Batal
            </button>
            
            <button
              onClick={handleConfirmPayment}
              disabled={loading || isInsufficient}
              className={`flex-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white shadow-sm transition ${
                isInsufficient
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                  : paymentMethod === "cash"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Konfirmasi Pembayaran
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
