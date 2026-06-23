import { supabase } from "../../lib/supabase/client";
import type { OrderFull, OrderStatus } from "./types";

// ==============================
// FETCH ORDERS
// ==============================

export type DateFilterType = "today" | "yesterday" | "all";

export async function fetchOrders(
  statusFilter?: OrderStatus | "all",
  dateFilter: DateFilterType = "today",
): Promise<OrderFull[]> {
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `,
    )
    .order("created_at", { ascending: false });

  if (dateFilter === "today") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    query = query.gte("created_at", startOfToday.toISOString());
  } else if (dateFilter === "yesterday") {
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    query = query
      .gte("created_at", startOfYesterday.toISOString())
      .lte("created_at", endOfYesterday.toISOString());
  }

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
