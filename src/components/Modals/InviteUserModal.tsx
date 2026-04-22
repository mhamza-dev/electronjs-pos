import React from "react";
import { Form } from "../Form";
import { TextInput, SelectInput } from "../Inputs";
import { Button } from "../Buttons";
import * as yup from "yup";
import { supabase } from "../../lib/supabase";
import { rbacService, employeeService } from "../../services";
import { AuthRole } from "../../data/type";

interface InviteUserModalProps {
  businessId: string;
  roles: AuthRole[];
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  role_id: yup.string().required("Role is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  job_title: yup.string(),
  phone: yup.string(),
});

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  businessId,
  roles,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Invite user via Supabase Auth
      const { data: inviteData, error: inviteError } =
        await supabase.auth.admin.inviteUserByEmail(values.email, {
          data: {
            full_name: `${values.first_name} ${values.last_name}`,
          },
        });

      if (inviteError) throw inviteError;
      const userId = inviteData.user.id;

      // 2. Assign role to the user in this business
      await rbacService.assignRoleToUser(
        businessId,
        userId,
        values.role_id,
        (await supabase.auth.getUser()).data.user?.id || userId,
      );

      // 3. Create employee record
      // First, find or create department (e.g., "General")
      const { data: dept } = await supabase
        .from("org_departments")
        .select("id")
        .eq("business_id", businessId)
        .eq("department_name", "General")
        .maybeSingle();

      let deptId = dept?.id;
      if (!deptId) {
        const { data: newDept } = await supabase
          .from("org_departments")
          .insert({
            business_id: businessId,
            department_name: "General",
            code: "GEN",
          })
          .select("id")
          .single();
        deptId = newDept?.id;
      }

      await employeeService.createEmployee({
        business_id: businessId,
        department_id: deptId,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone || null,
        job_title: values.job_title || null,
        employment_status: "active",
        hired_at: new Date().toISOString().split("T")[0],
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to invite user");
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    email: "",
    role_id: roles[0]?.id || "",
    first_name: "",
    last_name: "",
    job_title: "",
    phone: "",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-7xl max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Invite New User</h3>
          <p className="text-sm text-gray-500 mt-1">
            Send an invitation email to add a new team member
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-sm bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <Form
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <div className="space-y-md">
              <TextInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="colleague@example.com"
                required
              />

              <SelectInput
                name="role_id"
                label="Assign Role"
                options={roles.map((r) => ({
                  label: r.role_name,
                  value: r.id,
                }))}
                required
              />

              <div className="grid grid-cols-2 gap-md">
                <TextInput
                  name="first_name"
                  label="First Name"
                  placeholder="John"
                  required
                />
                <TextInput
                  name="last_name"
                  label="Last Name"
                  placeholder="Doe"
                  required
                />
              </div>

              <TextInput
                name="job_title"
                label="Job Title"
                placeholder="e.g., Cashier, Manager"
              />

              <TextInput
                name="phone"
                label="Phone Number"
                placeholder="+1 234 567 890"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                Send Invitation
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;
