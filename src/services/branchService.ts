// services/branchService.ts
import { supabase } from "../lib/supabase";
import type { Branch, BranchInsert } from "../data/types";

export async function getBranchById(id: string) {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Branch | null, error };
}

export async function listBranchesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Branch[] | null, error };
}

export async function createBranch(branch: BranchInsert) {
  const { data, error } = await supabase
    .from("branches")
    .insert(branch)
    .select()
    .single();
  return { data: data as Branch | null, error };
}

export async function updateBranch(id: string, updates: Partial<BranchInsert>) {
  const { data, error } = await supabase
    .from("branches")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Branch | null, error };
}

export async function softDeleteBranch(id: string) {
  const { error } = await supabase
    .from("branches")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
