// ==============================
// Order Row (from Supabase)
// ==============================

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string;
  price: number;
  qty: number;
  subtotal: number;
};

export type OrderRow = {
  id: string;
  total_price: number;
  status: string; // 'pending' | 'processing' | 'done' | 'cancelled'
  created_at: string;
};

// ==============================
// Full Order (with items)
// ==============================

export type OrderFull = OrderRow & {
  order_items: OrderItemRow[];
};

// ==============================
// Status
// ==============================

export const ORDER_STATUSES = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Diproses", color: "bg-blue-100 text-blue-700" },
  done: { label: "Selesai", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;
