import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  UserProfile,
  BusinessUserMembership,
  AuthPermission,
} from "../data/type";

export const authService = {
  // ------------------------------------------------------------
  // Authentication Basics
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Profile & Business Context (one role per business)
  // ------------------------------------------------------------
  async getProfile(user: User): Promise<UserProfile> {
    // 1. Fetch user's business role assignments (expect one per business)
    const { data: roleAssignments, error: rolesError } = await supabase
      .from("auth_user_business_roles")
      .select(
        `
        id,
        business_id,
        assigned_at,
        role:auth_roles!inner(
          id,
          role_name,
          description
        ),
        business:org_businesses!inner(*)
      `,
      )
      .eq("user_id", user.id);

    if (rolesError) throw rolesError;

    // 2. Build memberships – one per business (take first role if multiple exist)
    const businessUsers: BusinessUserMembership[] = (roleAssignments || []).map(
      (assignment: any) => ({
        business_id: assignment.business_id,
        business: assignment.business,
        role: assignment.role,
        joined_at: assignment.assigned_at,
      }),
    );

    // 3. Fetch current business preference from user_settings
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("current_business_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) throw settingsError;

    const currentBusinessId =
      settings?.current_business_id || businessUsers[0]?.business_id || null;

    // 4. Return unified profile object
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      business_users: businessUsers,
      current_business_id: currentBusinessId,
    };
  },

  // ------------------------------------------------------------
  // Business Switching
  // ------------------------------------------------------------
  async switchBusiness(userId: string, businessId: string): Promise<void> {
    // Verify user belongs to that business
    const { data: membership, error } = await supabase
      .from("auth_user_business_roles")
      .select("business_id")
      .eq("user_id", userId)
      .eq("business_id", businessId)
      .maybeSingle();

    if (error) throw error;
    if (!membership) {
      throw new Error("User does not belong to this business");
    }

    // Update user_settings
    const { error: upsertError } = await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        current_business_id: businessId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (upsertError) throw upsertError;
  },

  // ------------------------------------------------------------
  // Permissions (for current or specified business)
  // ------------------------------------------------------------
  async getUserPermissions(
    userId: string,
    businessId?: string,
  ): Promise<AuthPermission[]> {
    let query = supabase
      .from("auth_user_business_roles")
      .select(
        `
        role:auth_roles(
          role_permissions:auth_role_permissions(
            permission:auth_permissions(*)
          )
        )
      `,
      )
      .eq("user_id", userId);

    if (businessId) {
      query = query.eq("business_id", businessId);
    } else {
      // Fallback to current business from settings
      const { data: settings } = await supabase
        .from("user_settings")
        .select("current_business_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!settings?.current_business_id) {
        return [];
      }
      query = query.eq("business_id", settings.current_business_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Flatten and deduplicate permissions (user has only one role, but still dedupe just in case)
    const permissionMap = new Map<string, AuthPermission>();
    data?.forEach((item: any) => {
      item.role?.role_permissions?.forEach((rp: any) => {
        const perm = rp.permission;
        if (perm) {
          permissionMap.set(perm.id, perm);
        }
      });
    });

    return Array.from(permissionMap.values());
  },

  async hasPermission(
    userId: string,
    permissionKey: string,
    businessId?: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, businessId);
    return permissions.some((p) => p.permission_key === permissionKey);
  },

  async refreshSession(): Promise<User | null> {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.user ?? null;
  },
};
