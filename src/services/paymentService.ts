// services/paymentService.ts
import { supabase } from "../lib/supabase";
import type { Payment, PaymentInsert } from "../data/types";

export async function getPaymentById(id: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Payment | null, error };
}

export async function listPaymentsBySale(saleId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("sale_id", saleId)
    .is("deleted_at", null);
  return { data: data as Payment[] | null, error };
}

export async function listPaymentsByPurchase(purchaseId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("purchase_id", purchaseId)
    .is("deleted_at", null);
  return { data: data as Payment[] | null, error };
}

export async function createPayment(payment: PaymentInsert) {
  const { data, error } = await supabase
    .from("payments")
    .insert(payment)
    .select()
    .single();
  return { data: data as Payment | null, error };
}

export async function updatePayment(
  id: string,
  updates: Partial<PaymentInsert>,
) {
  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Payment | null, error };
}

export async function softDeletePayment(id: string) {
  const { error } = await supabase
    .from("payments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
