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

  // 3. Decrement stock for each item's variant
  for (const item of items) {
    if (item.variant_id) {
      // Get current stock
      const { data: variantData, error: fetchError } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variant_id)
        .single();

      if (!fetchError && variantData) {
        const currentStock = variantData.stock || 0;
        const newStock = Math.max(0, currentStock - item.qty);

        // Update variant stock
        await supabase
          .from("product_variants")
          .update({ stock: newStock })
          .eq("id", item.variant_id);
      }
    }
  }

  return orderId;
}
