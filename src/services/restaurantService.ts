// services/restaurantService.ts
import { supabase } from "../lib/supabase";
import type {
  RestaurantTable,
  RestaurantTableInsert,
  KitchenOrder,
  KitchenOrderInsert,
} from "../data/types";

// ── Restaurant Tables ───────────────────────────────────────────
export async function getTableById(id: string) {
  const { data, error } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as RestaurantTable | null, error };
}

export async function listTablesByBranch(branchId: string) {
  const { data, error } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("branch_id", branchId)
    .is("deleted_at", null);
  return { data: data as RestaurantTable[] | null, error };
}

export async function listTablesByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as RestaurantTable[] | null, error };
}

export async function createTable(table: RestaurantTableInsert) {
  const { data, error } = await supabase
    .from("restaurant_tables")
    .insert(table)
    .select()
    .single();
  return { data: data as RestaurantTable | null, error };
}

export async function updateTable(
  id: string,
  updates: Partial<RestaurantTableInsert>,
) {
  const { data, error } = await supabase
    .from("restaurant_tables")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as RestaurantTable | null, error };
}

export async function softDeleteTable(id: string) {
  const { error } = await supabase
    .from("restaurant_tables")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

// ── Kitchen Orders ──────────────────────────────────────────────
export async function getKitchenOrderById(id: string) {
  const { data, error } = await supabase
    .from("kitchen_orders")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as KitchenOrder | null, error };
}

export async function listKitchenOrdersByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("kitchen_orders")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as KitchenOrder[] | null, error };
}

export async function listKitchenOrdersByBranch(branchId: string) {
  const { data, error } = await supabase
    .from("kitchen_orders")
    .select("*")
    .eq("branch_id", branchId)
    .is("deleted_at", null);
  return { data: data as KitchenOrder[] | null, error };
}

export async function listKitchenOrdersByTable(tableId: string) {
  const { data, error } = await supabase
    .from("kitchen_orders")
    .select("*")
    .eq("table_id", tableId)
    .is("deleted_at", null);
  return { data: data as KitchenOrder[] | null, error };
}

export async function createKitchenOrder(order: KitchenOrderInsert) {
  const { data, error } = await supabase
    .from("kitchen_orders")
    .insert(order)
    .select()
    .single();
  return { data: data as KitchenOrder | null, error };
}

export async function updateKitchenOrder(
  id: string,
  updates: Partial<KitchenOrderInsert>,
) {
  const { data, error } = await supabase
    .from("kitchen_orders")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as KitchenOrder | null, error };
}

export async function softDeleteKitchenOrder(id: string) {
  const { error } = await supabase
    .from("kitchen_orders")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
