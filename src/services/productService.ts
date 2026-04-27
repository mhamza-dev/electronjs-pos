// services/productService.ts
import { supabase } from "../lib/supabase";
import type {
  Product,
  ProductInsert,
  InventoryMovement,
  InventoryMovementInsert,
} from "../data/types";

// ── Products ────────────────────────────────────────────────────
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as Product | null, error };
}

export async function listProductsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as Product[] | null, error };
}

export async function listProductsByBranch(branchId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("branch_id", branchId)
    .is("deleted_at", null);
  return { data: data as Product[] | null, error };
}

export async function createProduct(product: ProductInsert) {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();
  return { data: data as Product | null, error };
}

export async function updateProduct(
  id: string,
  updates: Partial<ProductInsert>,
) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  return { data: data as Product | null, error };
}

export async function softDeleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}

// ── Inventory Movements ─────────────────────────────────────────
export async function getInventoryMovementById(id: string) {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  return { data: data as InventoryMovement | null, error };
}

export async function listMovementsByProduct(productId: string) {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*")
    .eq("product_id", productId)
    .is("deleted_at", null);
  return { data: data as InventoryMovement[] | null, error };
}

export async function listMovementsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null);
  return { data: data as InventoryMovement[] | null, error };
}

export async function createInventoryMovement(
  movement: InventoryMovementInsert,
) {
  const { data, error } = await supabase
    .from("inventory_movements")
    .insert(movement)
    .select()
    .single();
  return { data: data as InventoryMovement | null, error };
}

export async function softDeleteInventoryMovement(id: string) {
  const { error } = await supabase
    .from("inventory_movements")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error };
}
