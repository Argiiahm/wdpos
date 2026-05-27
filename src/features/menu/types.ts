import type { ProductFull } from "../products/types";

// ==============================
// Cart Types
// ==============================

export type CartItemOption = {
  optionName: string;
  valueName: string;
  extraPrice: number;
};

export type CartItem = {
  id: string; // client-side UUID for cart key
  productId: string;
  productName: string;
  productImage: string;
  variantId: string | null;
  variantName: string;
  basePrice: number;
  options: CartItemOption[];
  qty: number;
};

// ==============================
// Order Types (for Supabase)
// ==============================

export type OrderItemPayload = {
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string;
  price: number;
  qty: number;
  subtotal: number;
};

export type OrderPayload = {
  total_price: number;
  status: string;
  items: OrderItemPayload[];
};

// ==============================
// Re-export ProductFull for convenience
// ==============================

export type { ProductFull };
