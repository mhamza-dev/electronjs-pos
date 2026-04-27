// services/businessService.ts
import { supabase } from "../lib/supabase";
import type { Business, BusinessInsert, BusinessUpdate } from "../data/types";

export async function getBusinessById(id: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Business | null, error };
}

export async function listBusinessesForOwner(ownerId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", ownerId)
    .is("deleted_at", null);
  return { data: data as Business[] | null, error };
}

export async function createBusiness(business: BusinessInsert) {
  const { data, error } = await supabase
    .from("businesses")
    .insert(business)
    .select()
    .single();
  return { data: data as Business | null, error };
}

export async function updateBusiness(
  id: string,
  updates: Partial<BusinessUpdate>,
) {
  const { data, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Business | null, error };
}

export async function softDeleteBusiness(id: string) {
  const { error } = await supabase
    .from("businesses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
