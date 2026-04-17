// services/settingsService.ts
import { supabase } from "../lib/supabase";
import { SysSetting } from "../data/type";

export const settingsService = {
  async getSettings(businessId: string): Promise<SysSetting[]> {
    const { data, error } = await supabase
      .from("sys_settings")
      .select("*")
      .eq("business_id", businessId);
    if (error) throw error;
    return data || [];
  },

  async getSetting(
    businessId: string,
    key: string,
  ): Promise<SysSetting | null> {
    const { data, error } = await supabase
      .from("sys_settings")
      .select("*")
      .eq("business_id", businessId)
      .eq("setting_key", key)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async setSetting(
    businessId: string,
    key: string,
    value: any,
  ): Promise<SysSetting> {
    const { data, error } = await supabase
      .from("sys_settings")
      .upsert(
        {
          business_id: businessId,
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "business_id,setting_key" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSetting(businessId: string, key: string): Promise<void> {
    const { error } = await supabase
      .from("sys_settings")
      .delete()
      .eq("business_id", businessId)
      .eq("setting_key", key);
    if (error) throw error;
  },
};
