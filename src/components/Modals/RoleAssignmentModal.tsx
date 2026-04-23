import React, { useState } from "react";
import { Button } from "../../components/Buttons";
import { AuthRole, Employee } from "../../data/type";
import { Form } from "../Form";
import { SelectInput } from "../Inputs";

interface RoleAssignmentModalProps {
  selectedUser: Employee;
  roles: AuthRole[];
  onAssign: (values: { role_id: string }) => void;
  onClose: () => void;
}

const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  selectedUser,
  roles,
  onAssign,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-7xl min-w-5xl max-h-[80vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Change Role
        </h3>
        <Form
          initialValues={{
            role_id:
              roles.find((role) => role.role_name === selectedUser.role)?.id ||
              "",
          }}
          onSubmit={(values) => onAssign(values)}
        >
          <SelectInput
            name="role_id"
            label="Role"
            required
            options={roles.map((role) => ({
              label: role.role_name,
              value: role.id,
            }))}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;
