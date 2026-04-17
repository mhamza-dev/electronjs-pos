// services/posService.ts
import { supabase } from "../lib/supabase";
import { PosCustomer, PosSalesOrder, PosSaleItem } from "../data/type";

export const posService = {
  // ------------------------------------------------------------
  // Customers
  // ------------------------------------------------------------
  async getCustomers(businessId: string): Promise<PosCustomer[]> {
    const { data, error } = await supabase
      .from("pos_customers")
      .select("*")
      .eq("business_id", businessId)
      .order("customer_name");
    if (error) throw error;
    return data || [];
  },

  async createCustomer(
    businessId: string,
    customer: Omit<
      PosCustomer,
      "id" | "business_id" | "created_at" | "updated_at"
    >,
  ): Promise<PosCustomer> {
    const { data, error } = await supabase
      .from("pos_customers")
      .insert({ business_id: businessId, ...customer })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async updateCustomer(
    customerId: string,
    updates: Partial<Omit<PosCustomer, "id" | "business_id" | "created_at">>,
  ): Promise<PosCustomer> {
    const { data, error } = await supabase
      .from("pos_customers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", customerId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  // ------------------------------------------------------------
  // Sales Orders
  // ------------------------------------------------------------
  async getOrders(
    businessId: string,
    filters?: { status?: string; fromDate?: string },
  ): Promise<PosSalesOrder[]> {
    let query = supabase
      .from("pos_sales_orders")
      .select(
        "*, customer:pos_customers(*), items:pos_sale_items(*, product:catalog_products(*))",
      )
      .eq("business_id", businessId)
      .order("order_date", { ascending: false });

    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.fromDate) query = query.gte("order_date", filters.fromDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getOrder(orderId: string): Promise<
    PosSalesOrder & {
      customer?: PosCustomer;
      items?: (PosSaleItem & { product?: any })[];
    }
  > {
    const { data, error } = await supabase
      .from("pos_sales_orders")
      .select(
        "*, customer:pos_customers(*), items:pos_sale_items(*, product:catalog_products(*))",
      )
      .eq("id", orderId)
      .single();
    if (error) throw error;
    return data;
  },

  async createOrder(
    businessId: string,
    order: {
      customer_id?: string | null;
      cashier_employee_id?: string | null;
      items: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
        discount_amount?: number;
        tax_amount?: number;
      }>;
      payment_status?: string;
    },
  ): Promise<PosSalesOrder> {
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate totals
    let subtotal = 0;
    let tax = 0;
    order.items.forEach((item) => {
      const lineSubtotal = item.quantity * item.unit_price;
      const lineDiscount = item.discount_amount || 0;
      const lineTax = item.tax_amount || 0;
      subtotal += lineSubtotal - lineDiscount;
      tax += lineTax;
    });

    const { data: orderData, error: orderError } = await supabase
      .from("pos_sales_orders")
      .insert({
        business_id: businessId,
        customer_id: order.customer_id,
        cashier_employee_id: order.cashier_employee_id,
        order_number: orderNumber,
        status: "completed",
        payment_status: order.payment_status || "paid",
        subtotal_amount: subtotal,
        tax_amount: tax,
        total_amount: subtotal + tax,
      })
      .select("*")
      .single();
    if (orderError) throw orderError;

    // Insert items
    const itemsToInsert = order.items.map((item) => ({
      business_id: businessId,
      sales_order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount || 0,
      tax_amount: item.tax_amount || 0,
    }));

    const { error: itemsError } = await supabase
      .from("pos_sale_items")
      .insert(itemsToInsert);
    if (itemsError) throw itemsError;

    // Update inventory (deduct sold quantities) – could be a database trigger instead
    for (const item of order.items) {
      await supabase.rpc("adjust_inventory", {
        p_product_id: item.product_id,
        p_adjustment: -item.quantity,
        p_reason: `Sale ${orderNumber}`,
      });
    }

    return orderData;
  },

  async updateOrderStatus(
    orderId: string,
    status: string,
  ): Promise<PosSalesOrder> {
    const { data, error } = await supabase
      .from("pos_sales_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
};
