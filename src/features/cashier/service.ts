import { supabase } from "../../lib/supabase/client";
import type { OrderFull, OrderStatus } from "./types";

// ==============================
// FETCH ORDERS
// ==============================

export async function fetchOrders(
  statusFilter?: OrderStatus | "all",
): Promise<OrderFull[]> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `,
    )
    .gte("created_at", startOfToday.toISOString())
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as OrderFull[]) ?? [];
}

// ==============================
// UPDATE ORDER STATUS
// ==============================

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}

// ==============================
// DELETE ORDER
// ==============================

export async function deleteOrder(orderId: string): Promise<void> {
  // order_items will cascade delete
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) throw error;
}
