import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { UserProfile } from "../data/type";

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

  async getProfile(user: User): Promise<UserProfile> {
    console.log("user in getProfile ->", user);
    // 1. Fetch business memberships with role details and nested business data
    const { data: businessUsers, error: accessError } = await supabase
      .from("business_users")
      .select(
        `
      *,
      role:role_id (
        id,
        name
      ),
      business:business_id(*)
    `,
      )
      .eq("user_id", user.id);

    if (accessError) throw accessError;

    console.log("Business Users -> ", businessUsers);

    // 2. (Optional) Fetch current business from a user_settings table if it exists
    // If you have a user_settings table, uncomment and use it:

    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("current_business_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) throw settingsError;
    const currentBusinessId =
      settings?.current_business_id || businessUsers?.[0]?.business?.id || null;

    // 3. Return unified profile object with role info
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      business_users: businessUsers.map((bu) => ({
        id: bu.id,
        status: bu.status,
        joined_at: bu.joined_at,
        role_name: bu.role.name, // take first role
        business: bu.business, // e.g., 'admin', 'manager', 'cashier'              // remove the nested role object if you prefer flat
      })),
      current_business_id: currentBusinessId,
    };
  },
};
