// services/supplierService.ts
import { supabase } from "../lib/supabase";
import type { Supplier, SupplierInsert } from "../data/types";

export async function getSupplierById(id: string) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Supplier | null, error };
}

export async function listSuppliersByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Supplier[] | null, error };
}

export async function createSupplier(supplier: SupplierInsert) {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(supplier)
    .select()
    .single();
  return { data: data as Supplier | null, error };
}

export async function updateSupplier(
  id: string,
  updates: Partial<SupplierInsert>,
) {
  const { data, error } = await supabase
    .from("suppliers")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Supplier | null, error };
}

export async function softDeleteSupplier(id: string) {
  const { error } = await supabase
    .from("suppliers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
