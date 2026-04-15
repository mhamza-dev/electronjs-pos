// services/itemsService.ts
import { supabase } from "../lib/supabase";
import { Item, ItemInsert, ItemUpdate } from "../data/type";

export const itemsService = {
  /**
   * Get all items for a business (cashier, manager, admin)
   */
  async getItems(businessId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("business_id", businessId)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single item by ID (cashier, manager, admin)
   */
  async getItemById(id: string): Promise<Item> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new item (manager, admin)
   */
  async createItem(item: ItemInsert): Promise<Item> {
    const { data, error } = await supabase
      .from("items")
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing item (manager, admin)
   */
  async updateItem(id: string, updates: ItemUpdate): Promise<Item> {
    const { data, error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an item (admin only)
   */
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Toggle active status (manager, admin)
   */
  async toggleItemStatus(id: string, isActive: boolean): Promise<Item> {
    return this.updateItem(id, { is_active: isActive });
  },

  /**
   * Bulk create items (manager, admin)
   */
  async bulkCreateItems(items: ItemInsert[]): Promise<Item[]> {
    const { data, error } = await supabase.from("items").insert(items).select();

    if (error) throw error;
    return data || [];
  },

  /**
   * Search items by name or SKU (cashier, manager, admin)
   */
  async searchItems(businessId: string, query: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("business_id", businessId)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  },
};
