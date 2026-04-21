// services/rbacService.ts
import { supabase } from "../lib/supabase";
import { AuthRole, AuthPermission } from "../data/type";

export const rbacService = {
  // ------------------------------------------------------------
  // Roles
  // ------------------------------------------------------------
  async getRoles(businessId: string): Promise<AuthRole[]> {
    const { data, error } = await supabase
      .from("auth_roles")
      .select("*")
      .eq("business_id", businessId)
      .order("role_name");
    if (error) throw error;
    return data || [];
  },

  async createRole(
    businessId: string,
    role: { role_name: string; description?: string; is_system_role?: boolean },
  ): Promise<AuthRole> {
    const { data, error } = await supabase
      .from("auth_roles")
      .insert({ business_id: businessId, ...role })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async updateRole(
    roleId: string,
    updates: Partial<Pick<AuthRole, "role_name" | "description">>,
  ): Promise<AuthRole> {
    const { data, error } = await supabase
      .from("auth_roles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", roleId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRole(roleId: string): Promise<void> {
    const { error } = await supabase
      .from("auth_roles")
      .delete()
      .eq("id", roleId);
    if (error) throw error;
  },

  // ------------------------------------------------------------
  // Permissions
  // ------------------------------------------------------------
  async getAllPermissions(): Promise<AuthPermission[]> {
    const { data, error } = await supabase
      .from("auth_permissions")
      .select("*")
      .order("module_name");
    if (error) throw error;
    return data || [];
  },

  async getRolePermissions(roleId: string): Promise<AuthPermission[]> {
    const { data, error } = await supabase
      .from("auth_role_permissions")
      .select("permission:auth_permissions(*)")
      .eq("role_id", roleId);
    if (error) throw error;
    return (data || []).map((item: any) => item.permission);
  },

  async assignPermissionToRole(
    businessId: string,
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    const { error } = await supabase.from("auth_role_permissions").insert({
      business_id: businessId,
      role_id: roleId,
      permission_id: permissionId,
    });
    if (error) throw error;
  },

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("auth_role_permissions")
      .delete()
      .eq("role_id", roleId)
      .eq("permission_id", permissionId);
    if (error) throw error;
  },

  // ------------------------------------------------------------
  // User Role Assignments
  // ------------------------------------------------------------
  async assignRoleToUser(
    businessId: string,
    userId: string,
    roleId: string,
    assignedByUserId: string,
  ): Promise<void> {
    const { error } = await supabase.from("auth_user_business_roles").upsert(
      {
        business_id: businessId,
        user_id: userId,
        role_id: roleId,
        assigned_by_user_id: assignedByUserId,
        assigned_at: new Date().toISOString(),
      },
      { onConflict: "business_id,user_id" }, // if conflict, update role_id
    );
    if (error) throw error;
  },

  async removeRoleFromUser(
    businessId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("auth_user_business_roles")
      .delete()
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .eq("role_id", roleId);
    if (error) throw error;
  },

  async getUserRoles(businessId: string, userId: string): Promise<AuthRole[]> {
    const { data, error } = await supabase
      .from("auth_user_business_roles")
      .select("role:auth_roles(*)")
      .eq("business_id", businessId)
      .eq("user_id", userId);
    if (error) throw error;
    return (data || []).map((item: any) => item.role);
  },
};
