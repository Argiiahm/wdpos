import { Loader2, ShoppingBag, ShoppingCart } from "lucide-react";
import ListOrder from "./ListOrder";
import type { CartItem, OrderItemPayload } from "../types";
import { createOrder } from "../service";
import { useState } from "react";

type OrderListsProps = {
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onClearCart: () => void;
};

const OrderLists = ({
  cartItems,
  onRemoveItem,
  onUpdateQty,
  onClearCart,
}: OrderListsProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.basePrice * item.qty,
    0,
  );

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID").format(p);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const items: OrderItemPayload[] = cartItems.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        variant_name: item.variantName,
        price: item.basePrice,
        qty: item.qty,
        subtotal: item.basePrice * item.qty,
      }));

      await createOrder(items, subtotal);
      setSuccessMsg("Pesanan berhasil dibuat! ✓");
      onClearCart();

      // Auto-dismiss success
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat pesanan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col border-l border-gray-200 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <ShoppingBag size={18} className="text-zinc-500" />
        <h1 className="font-semibold">Order Lists</h1>
        {totalItems > 0 && (
          <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 font-mono">
            {totalItems}
          </span>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
          {successMsg}
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-300">
            <ShoppingCart size={36} className="mb-2" />
            <p className="text-sm text-zinc-400">Belum ada pesanan</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <ListOrder
              key={item.id}
              item={item}
              onRemove={onRemoveItem}
              onUpdateQty={onUpdateQty}
            />
          ))
        )}
      </div>

      {/* Checkout */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 pt-4 bg-white">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 font-mono">{totalItems} item</span>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Subtotal:</span>
              <span className="font-semibold font-mono">Rp {formatPrice(subtotal)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-medium text-white transition duration-300 ease-in-out hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Pesan sekarang</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderLists;
