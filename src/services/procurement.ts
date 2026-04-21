// services/procurementService.ts
import { supabase } from "../lib/supabase";
import { ProcurementSupplier, ProcurementPurchaseOrder } from "../data/type";

export const procurementService = {
  // ------------------------------------------------------------
  // Suppliers
  // ------------------------------------------------------------
  async getSuppliers(businessId: string): Promise<ProcurementSupplier[]> {
    const { data, error } = await supabase
      .from("procurement_suppliers")
      .select("*")
      .eq("business_id", businessId)
      .order("supplier_name");
    if (error) throw error;
    return data || [];
  },

  async createSupplier(
    businessId: string,
    supplier: Omit<
      ProcurementSupplier,
      "id" | "business_id" | "created_at" | "updated_at"
    >,
  ): Promise<ProcurementSupplier> {
    const { data, error } = await supabase
      .from("procurement_suppliers")
      .insert({ business_id: businessId, ...supplier })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async updateSupplier(
    supplierId: string,
    updates: Partial<
      Omit<ProcurementSupplier, "id" | "business_id" | "created_at">
    >,
  ): Promise<ProcurementSupplier> {
    const { data, error } = await supabase
      .from("procurement_suppliers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", supplierId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  // ------------------------------------------------------------
  // Purchase Orders
  // ------------------------------------------------------------
  async getPurchaseOrders(
    businessId: string,
    filters?: { status?: string; supplierId?: string },
  ): Promise<ProcurementPurchaseOrder[]> {
    let query = supabase
      .from("procurement_purchase_orders")
      .select(
        "*, supplier:procurement_suppliers(*), items:procurement_po_items(*, product:catalog_products(*))",
      )
      .eq("business_id", businessId)
      .order("order_date", { ascending: false });

    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.supplierId)
      query = query.eq("supplier_id", filters.supplierId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createPurchaseOrder(
    businessId: string,
    po: {
      supplier_id: string;
      requester_employee_id?: string | null;
      expected_date?: string;
      items: Array<{
        product_id: string;
        quantity: number;
        unit_cost: number;
        tax_amount?: number;
      }>;
    },
  ): Promise<ProcurementPurchaseOrder> {
    const poNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let subtotal = 0;
    let tax = 0;
    po.items.forEach((item) => {
      subtotal += item.quantity * item.unit_cost;
      tax += item.tax_amount || 0;
    });

    const { data: orderData, error: orderError } = await supabase
      .from("procurement_purchase_orders")
      .insert({
        business_id: businessId,
        supplier_id: po.supplier_id,
        requester_employee_id: po.requester_employee_id,
        po_number: poNumber,
        expected_date: po.expected_date,
        status: "ordered",
        subtotal_amount: subtotal,
        tax_amount: tax,
        total_amount: subtotal + tax,
      })
      .select("*")
      .single();
    if (orderError) throw orderError;

    const itemsToInsert = po.items.map((item) => ({
      business_id: businessId,
      purchase_order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      tax_amount: item.tax_amount || 0,
    }));

    const { error: itemsError } = await supabase
      .from("procurement_po_items")
      .insert(itemsToInsert);
    if (itemsError) throw itemsError;

    return orderData;
  },

  async receivePurchaseOrder(poId: string): Promise<void> {
    // Update status to 'received' and increase inventory
    const { data: po, error: fetchError } = await supabase
      .from("procurement_purchase_orders")
      .select("*, items:procurement_po_items(*)")
      .eq("id", poId)
      .single();
    if (fetchError) throw fetchError;

    // Update inventory for each item
    for (const item of po.items) {
      await supabase.rpc("adjust_inventory", {
        p_product_id: item.product_id,
        p_adjustment: item.quantity,
        p_reason: `PO Receive ${po.po_number}`,
      });
    }

    const { error: updateError } = await supabase
      .from("procurement_purchase_orders")
      .update({ status: "received", updated_at: new Date().toISOString() })
      .eq("id", poId);
    if (updateError) throw updateError;
  },
  async deleteSupplier(supplierId: string): Promise<void> {
    const { error } = await supabase
      .from("procurement_suppliers")
      .delete()
      .eq("id", supplierId);
    if (error) throw error;
  },
};
