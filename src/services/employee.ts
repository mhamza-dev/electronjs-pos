import { supabase } from "../lib/supabase";

export const employeeService = {
  async getEmployees(businessId: string) {
    let { data, error } = await supabase
      .from("profiles")
      .select("*, business_access(*)")
      .eq("business_access.business_id", businessId);
    if (error) throw error;

    data =
      data?.map((d) => ({
        ...d,
        role: d.business_access?.[0]?.role || "employee",
      })) || [];
    return data;
  },

  async updateEmployee(id: string, updates: any) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select("*, business_access(*)")
      .single();
    if (error) throw error;
    return data;
  },

  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ current_business_id: null })
      .eq("id", id);
    if (error) throw error;
  },

  async removeAccess(userId: string, businessId: string) {
    const { error } = await supabase
      .from("business_access")
      .delete()
      .eq("user_id", userId)
      .eq("business_id", businessId);
    if (error) throw error;
  },
};
