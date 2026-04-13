import { supabase } from "../lib/supabase";

export const productService = {
  async getProducts(businessId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId);
    if (error) throw error;
    return data;
  },

  async createProduct(product: any) {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const orderService = {
  async createOrder(order: any, items: any[]) {
    // 1. Create order
    const { data: orderData, error: oError } = await supabase
      .from("orders")
      .insert([order])
      .select()
      .single();

    if (oError) throw oError;

    // 2. Create items
    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: iError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (iError) throw iError;

    return orderData;
  },
};
