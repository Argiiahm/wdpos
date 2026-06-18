import { Loader2, Receipt, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { deleteOrder, fetchOrders } from "../service";
import type { OrderFull, OrderStatus } from "../types";
import { ORDER_STATUSES } from "../types";
import OrderCard from "../components/OrderCard";
import ConfirmDialog from "../../products/components/ConfirmDialog";

const statusFilters: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "processing", label: "Diproses" },
  { key: "done", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
];

const CashierPage = () => {
  // Data state
  const [orders, setOrders] = useState<OrderFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<OrderFull | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==============================
  // Fetch orders
  // ==============================

  const loadOrders = useCallback(
    async (filter?: OrderStatus | "all") => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrders(filter ?? activeFilter);
        setOrders(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal memuat pesanan.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [activeFilter],
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ==============================
  // Filter
  // ==============================

  const handleFilterChange = (filter: OrderStatus | "all") => {
    setActiveFilter(filter);
  };

  // ==============================
  // Delete
  // ==============================

  const handleOpenDelete = (order: OrderFull) => {
    setDeletingOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setDeleteLoading(true);
    try {
      await deleteOrder(deletingOrder.id);
      setDeleteDialogOpen(false);
      setDeletingOrder(null);
      loadOrders();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus pesanan.";
      setError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==============================
  // Counts per status
  // ==============================

  const getCountForStatus = (status: OrderStatus | "all") => {
    if (status === "all") {
      return orders.filter((o) => o.status === "pending" || o.status === "processing").length;
    }
    return orders.filter((o) => o.status === status).length;
  };

  const displayedOrders = activeFilter === "all"
    ? orders.filter((o) => o.status === "pending" || o.status === "processing")
    : orders;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-zinc-500">
          <Receipt size={22} />
          <h1 className="font-semibold text-lg">Kasir — Pesanan</h1>
        </div>
        <button
          onClick={() => loadOrders()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-50 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {statusFilters.map((filter) => {
          const isActive = activeFilter === filter.key;
          const count = getCountForStatus(filter.key);
          const statusStyle =
            filter.key !== "all"
              ? ORDER_STATUSES[filter.key as OrderStatus]
              : null;

          return (
            <button
              key={filter.key}
              onClick={() => handleFilterChange(filter.key)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition ${
                isActive
                  ? "border-zinc-800 bg-zinc-800 text-white"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
              }`}
            >
              {!isActive && statusStyle && (
                <span
                  className={`inline-block w-2 h-2 rounded-full ${statusStyle.color.split(" ")[0].replace("bg-", "bg-")}`}
                />
              )}
              {filter.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0 text-[11px] ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Loader2 size={32} className="animate-spin mb-3" />
          <span className="text-sm">Memuat pesanan...</span>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Receipt size={48} className="mb-3 text-zinc-300" />
          <p className="text-sm font-medium">
            {activeFilter === "all"
              ? "Belum ada pesanan aktif hari ini."
              : `Tidak ada pesanan dengan status "${statusFilters.find((f) => f.key === activeFilter)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {displayedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={() => loadOrders()}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingOrder(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Pesanan?"
        message={`Pesanan ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        loading={deleteLoading}
      />
    </section>
  );
};

export default CashierPage;
