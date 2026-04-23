import React from "react";
import { Form } from "../../components/Form";
import { TextInput, TextAreaInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import * as yup from "yup";

interface RoleFormModalProps {
  role: { id?: string; role_name: string; description?: string | null };
  onSave: (role: {
    id?: string;
    role_name: string;
    description?: string | null;
  }) => void;
  onClose: () => void;
}

const validationSchema = yup.object({
  role_name: yup.string().required("Role name is required"),
  description: yup.string().nullable(),
});

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  role,
  onSave,
  onClose,
}) => {
  const initialValues = {
    role_name: role.role_name || "",
    description: role.description || "",
  };

  const handleSubmit = (values: typeof initialValues) => {
    onSave({ ...role, ...values });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-7xl min-w-5xl max-h-[80vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {role.id ? "Edit Role" : "Create Role"}
        </h3>
        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <TextInput name="role_name" label="Role Name" required />
          <TextAreaInput name="description" label="Description" rows={3} />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RoleFormModal;
