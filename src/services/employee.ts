// services/employeeService.ts
import { supabase } from "../lib/supabase";
import { Employee, OrgEmployee } from "../data/type";

export const employeeService = {
  /**
   * Get all employees for a given business.
   * Uses the `employee_details` view which joins org_employees, auth.users, auth_roles.
   */
  async getEmployees(businessId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from("employee_details")
      .select("*")
      .eq("business_id", businessId)
      .order("user_full_name", { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.user_id, // auth.users id
      email: row.user_email,
      full_name: row.user_full_name,
      role: row.primary_role, // from auth_roles.role_name
      status: row.employment_status, // from org_employees
      designation: row.job_title,
      salary: null, // salary not present in new schema (can be added to org_employees)
      hired_at: row.hired_at,
      business_user_id: row.employee_id, // org_employees.id
    }));
  },

  /**
   * Update employee role, status, or job details.
   */
  async updateEmployee(
    userId: string,
    businessId: string,
    updates: {
      role?: string; // role_name to assign
      status?: string; // employment_status
      designation?: string; // job_title
      salary?: number; // not in org_employees by default (extend if needed)
    },
  ): Promise<Employee> {
    // 1. Update role if provided (via auth_user_business_roles)
    if (updates.role) {
      // Get the role ID for the given role_name in this business
      const { data: roleData, error: roleError } = await supabase
        .from("auth_roles")
        .select("id")
        .eq("business_id", businessId)
        .eq("role_name", updates.role)
        .single();

      if (roleError) throw new Error(`Role "${updates.role}" not found`);

      // Check if the user already has a role assignment in this business
      const { data: existingAssignment, error: checkError } = await supabase
        .from("auth_user_business_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAssignment) {
        // Update existing assignment
        const { error: updateError } = await supabase
          .from("auth_user_business_roles")
          .update({ role_id: roleData.id })
          .eq("id", existingAssignment.id);
        if (updateError) throw updateError;
      } else {
        // Create new assignment (should not happen normally)
        const { error: insertError } = await supabase
          .from("auth_user_business_roles")
          .insert({
            business_id: businessId,
            user_id: userId,
            role_id: roleData.id,
            assigned_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          });
        if (insertError) throw insertError;
      }
    }

    // 2. Update employee record in org_employees
    // First, find the employee record for this user in the business
    const { data: employee, error: empError } = await supabase
      .from("org_employees")
      .select("id")
      .eq(
        "email",
        (await supabase.auth.admin.getUserById(userId)).data.user?.email,
      ) // alternative: join via auth.users
      .eq("business_id", businessId)
      .maybeSingle();

    if (empError) throw empError;

    // If not found by email, try by user_id if you add a user_id column later
    if (!employee && (updates.status || updates.designation)) {
      // Could create a new employee record if needed, but usually it exists
      console.warn("Employee record not found, cannot update non-role fields");
    }

    if (employee) {
      const employeeUpdate: any = {};
      if (updates.status) employeeUpdate.employment_status = updates.status;
      if (updates.designation) employeeUpdate.job_title = updates.designation;
      // Salary field not in org_employees, you may add it or store elsewhere

      if (Object.keys(employeeUpdate).length > 0) {
        const { error: updateEmpError } = await supabase
          .from("org_employees")
          .update(employeeUpdate)
          .eq("id", employee.id);
        if (updateEmpError) throw updateEmpError;
      }
    }

    // Return the updated employee details
    const updatedList = await this.getEmployees(businessId);
    const updated = updatedList.find((emp) => emp.id === userId);
    if (!updated) throw new Error("Employee not found after update");
    return updated;
  },

  /**
   * Remove a user's access to a business (fire them).
   */
  async removeAccess(userId: string, businessId: string): Promise<void> {
    // 1. Delete from auth_user_business_roles
    const { error: roleError } = await supabase
      .from("auth_user_business_roles")
      .delete()
      .eq("user_id", userId)
      .eq("business_id", businessId);
    if (roleError) throw roleError;

    // 2. Delete from org_employees (if exists)
    // Use email to find employee; better to have user_id column on org_employees
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    if (user?.user?.email) {
      const { error: empError } = await supabase
        .from("org_employees")
        .delete()
        .eq("email", user.user.email)
        .eq("business_id", businessId);
      if (empError) throw empError;
    }
  },

  /**
   * Permanently delete a user account (requires service_role key – use sparingly).
   */
  async deleteUserAccount(userId: string): Promise<void> {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  },

  // services/employeeService.ts
  async createEmployee(employee: {
    business_id: string;
    department_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    job_title?: string | null;
    employment_status?: string;
    hired_at?: string;
  }): Promise<OrgEmployee> {
    const employee_code =
      "EMP" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const { data, error } = await supabase
      .from("org_employees")
      .insert({
        ...employee,
        employee_code,
        employment_status: employee.employment_status || "active",
        hired_at: employee.hired_at || new Date().toISOString().split("T")[0],
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
  // services/employeeService.ts
  async getEmployeeByUserId(
    businessId: string,
    userId: string,
  ): Promise<OrgEmployee | null> {
    // We assume org_employees.email matches auth.users.email, or we can join via a user_id field if added.
    // For now, we'll use email matching.
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    const email = user.user?.email;
    if (!email) return null;

    const { data, error } = await supabase
      .from("org_employees")
      .select("*")
      .eq("business_id", businessId)
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
