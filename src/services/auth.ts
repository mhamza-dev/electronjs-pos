import { supabase } from "../lib/supabase";

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signup(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, business_access(*, business:business_id(*))")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return { ...data, current_business_id: data.business_access?.[0]?.business_id || null };
  },
};
