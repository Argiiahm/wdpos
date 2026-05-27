import { supabase } from "../../lib/supabase/client";
import type { ProductFull } from "../products/types";
import type { OrderItemPayload } from "./types";

// ==============================
// FETCH MENU PRODUCTS
// ==============================

export async function fetchMenuProducts(
  searchQuery = "",
): Promise<ProductFull[]> {
  let query = supabase
    .from("products")
    .select(
      `
      *,
      product_variants (*),
      product_options (
        *,
        product_option_values (*)
      )
    `,
    )
    .order("name", { ascending: true });

  if (searchQuery.trim()) {
    query = query.ilike("name", `%${searchQuery.trim()}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as ProductFull[]) ?? [];
}

// ==============================
// CREATE ORDER
// ==============================

export async function createOrder(
  items: OrderItemPayload[],
  totalPrice: number,
): Promise<string> {
  // 1. Insert order
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      total_price: totalPrice,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  const orderId = orderData.id;

  // 2. Insert order items
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    variant_name: item.variant_name,
    price: item.price,
    qty: item.qty,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderId;
}
