// services/saleService.ts
import { supabase } from "../lib/supabase";
import type { Sale, SaleInsert, SaleItem, SaleItemInsert } from "../data/types";

// ── Sales ───────────────────────────────────────────────────────
export async function getSaleById(id: string) {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Sale | null, error };
}

export async function listSalesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Sale[] | null, error };
}

export async function createSale(sale: SaleInsert) {
  const { data, error } = await supabase
    .from("sales")
    .insert(sale)
    .select()
    .single();
  return { data: data as Sale | null, error };
}

export async function updateSale(id: string, updates: Partial<SaleInsert>) {
  const { data, error } = await supabase
    .from("sales")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Sale | null, error };
}

export async function softDeleteSale(id: string) {
  const { error } = await supabase
    .from("sales")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

// ── Sale Items ──────────────────────────────────────────────────
export async function getSaleItemById(id: string) {
  const { data, error } = await supabase
    .from("sale_items")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as SaleItem | null, error };
}

export async function listItemsOfSale(saleId: string) {
  const { data, error } = await supabase
    .from("sale_items")
    .select("*")
    .eq("sale_id", saleId)
    .is("deleted_at", null);
  return { data: data as SaleItem[] | null, error };
}

export async function addItemToSale(item: SaleItemInsert) {
  const { data, error } = await supabase
    .from("sale_items")
    .insert(item)
    .select()
    .single();
  return { data: data as SaleItem | null, error };
}

export async function updateSaleItem(
  id: string,
  updates: Partial<SaleItemInsert>,
) {
  const { data, error } = await supabase
    .from("sale_items")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as SaleItem | null, error };
}

export async function softDeleteSaleItem(id: string) {
  const { error } = await supabase
    .from("sale_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
