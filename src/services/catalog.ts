// services/catalogService.ts
import { supabase } from "../lib/supabase";
import {
  CatalogProduct,
  CatalogCategory,
  CatalogInventory,
} from "../data/type";

export const catalogService = {
  // ------------------------------------------------------------
  // Categories
  // ------------------------------------------------------------
  async getCategories(businessId: string): Promise<CatalogCategory[]> {
    const { data, error } = await supabase
      .from("catalog_categories")
      .select("*")
      .eq("business_id", businessId)
      .order("category_name");
    if (error) throw error;
    return data || [];
  },

  async createCategory(
    businessId: string,
    category: Pick<
      CatalogCategory,
      "category_name" | "slug" | "description" | "parent_category_id"
    >,
  ): Promise<CatalogCategory> {
    const { data, error } = await supabase
      .from("catalog_categories")
      .insert({ business_id: businessId, ...category })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(
    categoryId: string,
    updates: Partial<
      Pick<CatalogCategory, "category_name" | "slug" | "description">
    >,
  ): Promise<CatalogCategory> {
    const { data, error } = await supabase
      .from("catalog_categories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", categoryId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from("catalog_categories")
      .delete()
      .eq("id", categoryId);
    if (error) throw error;
  },

  // ------------------------------------------------------------
  // Products
  // ------------------------------------------------------------
  async getProducts(
    businessId: string,
    options?: { categoryId?: string; isActive?: boolean },
  ): Promise<CatalogProduct[]> {
    let query = supabase
      .from("catalog_products")
      .select(
        "*, categories:catalog_product_categories(category_id, catalog_categories(*))",
      )
      .eq("business_id", businessId);

    if (options?.isActive !== undefined) {
      query = query.eq("is_active", options.isActive);
    }
    if (options?.categoryId) {
      query = query.eq(
        "catalog_product_categories.category_id",
        options.categoryId,
      );
    }

    const { data, error } = await query.order("product_name");
    if (error) throw error;
    return data || [];
  },

  async getProduct(productId: string): Promise<
    CatalogProduct & {
      categories?: CatalogCategory[];
      inventory?: CatalogInventory;
    }
  > {
    const { data, error } = await supabase
      .from("catalog_products")
      .select(
        "*, categories:catalog_product_categories(category_id, catalog_categories(*)), inventory:catalog_inventory(*)",
      )
      .eq("id", productId)
      .single();
    if (error) throw error;
    return data;
  },

  async createProduct(
    businessId: string,
    product: Omit<
      CatalogProduct,
      "id" | "business_id" | "created_at" | "updated_at"
    >,
    categoryIds?: string[],
  ): Promise<CatalogProduct> {
    const { data, error } = await supabase
      .from("catalog_products")
      .insert({ business_id: businessId, ...product })
      .select("*")
      .single();
    if (error) throw error;

    if (categoryIds && categoryIds.length > 0) {
      const productCategories = categoryIds.map((catId, index) => ({
        business_id: businessId,
        product_id: data.id,
        category_id: catId,
        is_primary: index === 0,
      }));
      await supabase
        .from("catalog_product_categories")
        .insert(productCategories);
    }

    // Create initial inventory record
    await supabase.from("catalog_inventory").insert({
      business_id: businessId,
      product_id: data.id,
      on_hand_qty: 0,
      reorder_level: 10,
    });

    return data;
  },

  async updateProduct(
    productId: string,
    updates: Partial<Omit<CatalogProduct, "id" | "business_id" | "created_at">>,
  ): Promise<CatalogProduct> {
    const { data, error } = await supabase
      .from("catalog_products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from("catalog_products")
      .delete()
      .eq("id", productId);
    if (error) throw error;
  },

  // ------------------------------------------------------------
  // Inventory
  // ------------------------------------------------------------
  async getInventory(productId: string): Promise<CatalogInventory> {
    const { data, error } = await supabase
      .from("catalog_inventory")
      .select("*")
      .eq("product_id", productId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateInventory(
    productId: string,
    updates: Partial<
      Pick<
        CatalogInventory,
        "on_hand_qty" | "reserved_qty" | "reorder_level" | "average_cost"
      >
    >,
  ): Promise<CatalogInventory> {
    const { data, error } = await supabase
      .from("catalog_inventory")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("product_id", productId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async adjustInventory(
    productId: string,
    adjustment: number,
    reason?: string,
  ): Promise<void> {
    // Use a transaction or RPC for atomic update
    const { error } = await supabase.rpc("adjust_inventory", {
      p_product_id: productId,
      p_adjustment: adjustment,
      p_reason: reason || "manual_adjustment",
    });
    if (error) throw error;
  },
};
