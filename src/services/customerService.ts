// services/customerService.ts
import { supabase } from "../lib/supabase";
import type { Customer, CustomerInsert } from "../data/types";

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Customer | null, error };
}

export async function listCustomersByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Customer[] | null, error };
}

export async function createCustomer(customer: CustomerInsert) {
  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();
  return { data: data as Customer | null, error };
}

export async function updateCustomer(
  id: string,
  updates: Partial<CustomerInsert>,
) {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Customer | null, error };
}

export async function softDeleteCustomer(id: string) {
  const { error } = await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
