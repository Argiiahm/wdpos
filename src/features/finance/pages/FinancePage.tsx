import { useEffect, useState } from "react";
import { Banknote, Loader2, QrCode, RefreshCw, ShoppingBag, TrendingUp } from "lucide-react";
import { fetchFinanceTransactions } from "../service";
import type { FinanceTransaction } from "../service";

const FinancePage = () => {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      // 1. Try fetching from Supabase
      const dbData = await fetchFinanceTransactions();
      setTransactions(dbData);
    } catch (err: any) {
      console.warn("Supabase finance fetch failed, loading local transactions:", err);
      // Fallback to local
      const localData = JSON.parse(localStorage.getItem("local_finance_transactions") || "[]");
      // Sort by date descending
      const sortedLocal = localData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(sortedLocal);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID").format(p);

  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Get unique months from transactions
  const getMonthOptions = () => {
    const months = new Set<string>();
    // Always add current month as option
    const nowStr = new Date().toISOString().substring(0, 7);
    months.add(nowStr);
    
    transactions.forEach(t => {
      if (t.created_at) {
        months.add(t.created_at.substring(0, 7));
      }
    });

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  };

  const monthOptions = getMonthOptions();

  const formatMonthLabel = (yyyyMM: string) => {
    const [year, month] = yyyyMM.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  // Filtered list
  const filteredTransactions = transactions.filter((t) => {
    if (selectedMonth === "all") return true;
    return t.created_at && t.created_at.substring(0, 7) === selectedMonth;
  });

  // Math Calculations based on filtered list
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const cashRevenue = filteredTransactions.filter(t => t.payment_method === "cash").reduce((sum, t) => sum + Number(t.amount), 0);
  const qrisRevenue = filteredTransactions.filter(t => t.payment_method === "qris").reduce((sum, t) => sum + Number(t.amount), 0);
  const transactionCount = filteredTransactions.length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-zinc-950 dark:text-zinc-50">Laporan Keuangan</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Lacak ringkasan pemasukan dan riwayat aktivitas pembeli</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Monthly Filter Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 cursor-pointer"
          >
            <option value="all">Semua Bulan</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>

          <button
            onClick={loadFinanceData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Revenue */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Pemasukan</span>
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-lg">
              <TrendingUp size={16} />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900 dark:text-white mt-3">
            Rp {formatPrice(totalRevenue)}
          </p>
          <span className="text-[10px] text-zinc-400 mt-1 block">Akumulasi seluruh penjualan</span>
        </div>

        {/* Card 2: Cash earnings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pemasukan Tunai (Cash)</span>
            <span className="p-1.5 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-lg">
              <Banknote size={16} />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900 dark:text-white mt-3">
            Rp {formatPrice(cashRevenue)}
          </p>
          <span className="text-[10px] text-zinc-400 mt-1 block">Total pembayaran uang fisik</span>
        </div>

        {/* Card 3: QRIS earnings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pemasukan QRIS</span>
            <span className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-650 rounded-lg">
              <QrCode size={16} />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900 dark:text-white mt-3">
            Rp {formatPrice(qrisRevenue)}
          </p>
          <span className="text-[10px] text-zinc-400 mt-1 block">Total scan e-wallet & bank</span>
        </div>

        {/* Card 4: Count */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Transaksi</span>
            <span className="p-1.5 bg-zinc-100 dark:bg-zinc-850 text-zinc-600 rounded-lg">
              <ShoppingBag size={16} />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900 dark:text-white mt-3">
            {transactionCount}
          </p>
          <span className="text-[10px] text-zinc-400 mt-1 block">Jumlah struk terselesaikan</span>
        </div>

      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          Aktivitas & Jurnal Pemasukan
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Loader2 size={28} className="animate-spin mb-3" />
            <span className="text-xs">Memuat laporan...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <ShoppingBag size={36} className="text-zinc-250 mb-2" />
            <p className="text-xs font-semibold">Belum ada aktivitas transaksi terekam.</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <ShoppingBag size={36} className="text-zinc-250 mb-2" />
            <p className="text-xs font-semibold">Tidak ada aktivitas transaksi pada bulan terpilih.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Tanggal / Waktu</th>
                    <th className="pb-3">Pesanan (Order-ID)</th>
                    <th className="pb-3">Metode</th>
                    <th className="pb-3 text-right">Detail Menu</th>
                    <th className="pb-3 text-right">Jumlah Bayar</th>
                    <th className="pb-3 text-right">Kembalian</th>
                    <th className="pb-3 text-right pr-2">Total Tagihan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredTransactions.map((tx) => {
                    const items = tx.orders?.order_items || [];
                    const dateObj = new Date(tx.created_at);
                    
                    return (
                      <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                        {/* Date */}
                        <td className="py-3.5 pl-2 font-mono text-[11px] text-zinc-500">
                          {dateObj.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })} • {dateObj.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>

                        {/* Order ID */}
                        <td className="py-3.5">
                          <div className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                            #{tx.order_id.substring(0, 8).toUpperCase()}
                          </div>
                        </td>

                        {/* Method */}
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            tx.payment_method === "cash"
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200/20"
                              : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border border-blue-200/20"
                          }`}>
                            {tx.payment_method === "cash" ? (
                              <>
                                <Banknote size={10} />
                                Tunai
                              </>
                            ) : (
                              <>
                                <QrCode size={10} />
                                QRIS
                              </>
                            )}
                          </span>
                        </td>

                        {/* Menu details purchased */}
                        <td className="py-3.5 text-right max-w-xs">
                          <div className="flex flex-col gap-0.5 justify-end">
                            {items.length === 0 ? (
                              <span className="text-zinc-400 italic">Menu tidak terikat</span>
                            ) : (
                              items.map((item, index) => (
                                <span key={index} className="text-zinc-600 dark:text-zinc-400 font-medium">
                                  {item.product_name} <span className="font-mono text-[10px] bg-slate-100 dark:bg-zinc-800 px-1 rounded-sm text-zinc-500">{item.qty}x</span>
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Jumlah Bayar */}
                        <td className="py-3.5 text-right font-medium font-mono text-zinc-800 dark:text-zinc-200">
                          Rp {formatPrice(tx.payment_method === "cash" ? tx.cash_paid : tx.amount)}
                        </td>

                        {/* Kembalian */}
                        <td className="py-3.5 text-right font-medium font-mono text-zinc-500">
                          {tx.payment_method === "cash" ? `Rp ${formatPrice(tx.change_returned)}` : "Rp 0"}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 text-right font-bold font-mono text-zinc-900 dark:text-zinc-150 pr-2">
                          Rp {formatPrice(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden space-y-4">
              {filteredTransactions.map((tx) => {
                const items = tx.orders?.order_items || [];
                const dateObj = new Date(tx.created_at);
                const isCash = tx.payment_method === "cash";

                return (
                  <div key={tx.id} className="border border-zinc-100 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/20 dark:bg-zinc-950/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-zinc-850 dark:text-zinc-100 text-xs">
                          #{tx.order_id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-405 dark:text-zinc-500 font-mono block mt-0.5">
                          {dateObj.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })} • {dateObj.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isCash
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200/20"
                          : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border border-blue-200/20"
                      }`}>
                        {isCash ? <Banknote size={10} /> : <QrCode size={10} />}
                        {isCash ? "Tunai" : "QRIS"}
                      </span>
                    </div>

                    {/* Bought Items list */}
                    <div className="space-y-1 py-1.5 border-y border-dashed border-zinc-200 dark:border-zinc-800/60">
                      {items.length === 0 ? (
                        <span className="text-zinc-400 italic text-[10px]">Menu tidak terikat</span>
                      ) : (
                        items.map((item, index) => (
                          <div key={index} className="flex justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                            <span>{item.product_name}</span>
                            <span className="font-mono font-medium text-zinc-400">{item.qty}x</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer values */}
                    <div className="flex justify-between items-end pt-1">
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal">
                        <div>Bayar: Rp {formatPrice(isCash ? tx.cash_paid : tx.amount)}</div>
                        {isCash ? (
                          <div>Kembali: Rp {formatPrice(tx.change_returned)}</div>
                        ) : (
                          <div className="text-blue-600 dark:text-blue-400 font-semibold">QRIS Sukses</div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-405 block">Total Tagihan</span>
                        <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-xs">
                          Rp {formatPrice(tx.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </section>
  );
};

export default FinancePage;
