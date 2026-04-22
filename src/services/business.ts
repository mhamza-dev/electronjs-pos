// services/businessService.ts
import { supabase } from "../lib/supabase";
import { OrgBusiness, OrgDepartment } from "../data/type";

export const businessService = {
  /**
   * Get all businesses the current user belongs to.
   */
  async getUserBusinesses(userId: string): Promise<OrgBusiness[]> {
    const { data, error } = await supabase
      .from("auth_user_business_roles")
      .select("business:org_businesses!inner(*)")
      .eq("user_id", userId);

    if (error) throw error;
    // Deduplicate businesses (user may have multiple roles in same business)
    const businessMap = new Map<string, OrgBusiness>();
    data?.forEach((item: any) => {
      if (item.business) businessMap.set(item.business.id, item.business);
    });
    return Array.from(businessMap.values());
  },

  /**
   * Get a single business by ID.
   */
  async getBusiness(businessId: string): Promise<OrgBusiness> {
    const { data, error } = await supabase
      .from("org_businesses")
      .select("*")
      .eq("id", businessId)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update business details.
   */
  async updateBusiness(
    businessId: string,
    updates: Partial<
      Pick<
        OrgBusiness,
        "business_name" | "legal_name" | "timezone" | "currency_code" | "status"
      >
    >,
  ): Promise<OrgBusiness> {
    const { data, error } = await supabase
      .from("org_businesses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", businessId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get departments for a business.
   */
  async getDepartments(businessId: string): Promise<OrgDepartment[]> {
    const { data, error } = await supabase
      .from("org_departments")
      .select("*")
      .eq("business_id", businessId)
      .order("department_name");
    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new department.
   */
  async createDepartment(
    businessId: string,
    department: Pick<OrgDepartment, "department_name" | "code" | "description">,
  ): Promise<OrgDepartment> {
    const { data, error } = await supabase
      .from("org_departments")
      .insert({ business_id: businessId, ...department })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
  async createBusiness(params: {
    owner_user_id: string;
    business_name: string;
    legal_name?: string;
    timezone?: string;
    currency_code?: string;
    business_category?: string;
  }): Promise<OrgBusiness> {
    const slug = params.business_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data, error } = await supabase
      .from("org_businesses")
      .insert({
        owner_user_id: params.owner_user_id,
        business_name: params.business_name,
        legal_name: params.legal_name || params.business_name,
        slug,
        timezone: params.timezone || "UTC",
        currency_code: params.currency_code || "USD",
        status: "active",
        business_category: params.business_category || null,
      })
      .select("*")
      .single();

    if (error) throw error;

    // Seed default roles for the new business
    await this.seedDefaultRoles(data.id);

    // Create default department
    await supabase.from("org_departments").insert({
      business_id: data.id,
      department_name: "General",
      code: "GEN",
    });

    return data;
  },

  /**
   * Create default roles (admin, manager, cashier) for a new business.
   */
  async seedDefaultRoles(businessId: string): Promise<void> {
    const defaultRoles = [
      {
        role_name: "admin",
        description: "Full access to all features",
        is_system_role: true,
      },
      {
        role_name: "manager",
        description: "Manage day-to-day operations",
        is_system_role: false,
      },
      {
        role_name: "cashier",
        description: "Process sales only",
        is_system_role: false,
      },
    ];

    for (const role of defaultRoles) {
      await supabase.from("auth_roles").insert({
        business_id: businessId,
        ...role,
      });
    }

    // Optionally assign default permissions to these roles
    const { data: permissions } = await supabase
      .from("auth_permissions")
      .select("id, permission_key");
    const { data: roles } = await supabase
      .from("auth_roles")
      .select("id, role_name")
      .eq("business_id", businessId);

    const adminRole = roles?.find((r) => r.role_name === "admin");
    const managerRole = roles?.find((r) => r.role_name === "manager");
    const cashierRole = roles?.find((r) => r.role_name === "cashier");

    if (adminRole && permissions) {
      const adminPerms = permissions.map((p) => ({
        business_id: businessId,
        role_id: adminRole.id,
        permission_id: p.id,
      }));
      await supabase.from("auth_role_permissions").insert(adminPerms);
    }

    if (managerRole && permissions) {
      const managerPerms = permissions
        .filter((p) => p.permission_key !== "delete:all")
        .map((p) => ({
          business_id: businessId,
          role_id: managerRole.id,
          permission_id: p.id,
        }));
      await supabase.from("auth_role_permissions").insert(managerPerms);
    }

    if (cashierRole && permissions) {
      const readPerm = permissions.find((p) => p.permission_key === "read:all");
      if (readPerm) {
        await supabase.from("auth_role_permissions").insert({
          business_id: businessId,
          role_id: cashierRole.id,
          permission_id: readPerm.id,
        });
      }
    }
  },
};
