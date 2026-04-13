import { supabase } from "../lib/supabase";

export const businessService = {
  async getMyBusinesses() {
    const { data, error } = await supabase.from("businesses").select(`
        *,
        business_access!inner(role)
      `);
    if (error) throw error;
    return data;
  },

  async createBusiness(name: string, userId: string) {
    // 1. Create business
    const { data: business, error: bError } = await supabase
      .from("businesses")
      .insert([{ name, owner_id: userId }])
      .select()
      .single();

    if (bError) throw bError;

    // 2. Add owner access
    const { error: aError } = await supabase.from("business_access").insert([
      {
        user_id: userId,
        business_id: business.id,
        role: "admin",
      },
    ]);

    if (aError) throw aError;

    // 3. Set as current business in profile
    await supabase
      .from("profiles")
      .update({ current_business_id: business.id })
      .eq("id", userId);

    return business;
  },

  async getBusinessById(id: string) {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getAllBusinesses() {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name")
      .order("name");
    if (error) throw error;
    return data;
  },

  async joinBusiness(businessId: string, userId: string) {
    const { error } = await supabase.from("business_access").insert([
      {
        user_id: userId,
        business_id: businessId,
        role: "employee",
      },
    ]);

    if (error) throw error;

    await supabase
      .from("profiles")
      .update({ current_business_id: businessId })
      .eq("id", userId);
  },
};
