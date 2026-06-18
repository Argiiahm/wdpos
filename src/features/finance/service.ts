import { supabase } from "../../lib/supabase/client";

export type FinanceTransaction = {
  id: string;
  order_id: string;
  amount: number;
  payment_method: "cash" | "qris";
  cash_paid: number;
  change_returned: number;
  created_at: string;
  orders?: {
    total_price: number;
    created_at: string;
    order_items?: {
      product_name: string;
      qty: number;
      price: number;
    }[];
  };
};

export async function recordTransaction(payload: {
  orderId: string;
  amount: number;
  paymentMethod: "cash" | "qris";
  cashPaid: number;
  changeReturned: number;
}): Promise<void> {
  const { error } = await supabase
    .from("finance_transactions")
    .insert({
      order_id: payload.orderId,
      amount: payload.amount,
      payment_method: payload.paymentMethod,
      cash_paid: payload.cashPaid,
      change_returned: payload.changeReturned,
    });

  if (error) throw error;
}

export async function fetchFinanceTransactions(): Promise<FinanceTransaction[]> {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select(`
      *,
      orders (
        total_price,
        created_at,
        order_items (
          product_name,
          qty,
          price
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as FinanceTransaction[]) ?? [];
}
