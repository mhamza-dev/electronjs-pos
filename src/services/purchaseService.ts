// services/purchaseService.ts
import { supabase } from "../lib/supabase";
import type { Purchase, PurchaseInsert } from "../data/types";

export async function getPurchaseById(id: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Purchase | null, error };
}

export async function listPurchasesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Purchase[] | null, error };
}

export async function createPurchase(purchase: PurchaseInsert) {
  const { data, error } = await supabase
    .from("purchases")
    .insert(purchase)
    .select()
    .single();
  return { data: data as Purchase | null, error };
}

export async function updatePurchase(
  id: string,
  updates: Partial<PurchaseInsert>,
) {
  const { data, error } = await supabase
    .from("purchases")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Purchase | null, error };
}

export async function softDeletePurchase(id: string) {
  const { error } = await supabase
    .from("purchases")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
