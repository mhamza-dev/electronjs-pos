import React, { useState } from "react";
import { Button } from "../../components/Buttons";
import { AuthRole } from "../../data/type";

interface RoleAssignmentModalProps {
  userId: string;
  businessId: string;
  roles: AuthRole[];
  currentRole: string | null;
  onAssign: (userId: string, roleId: string) => void;
  onClose: () => void;
}

const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  userId,
  businessId,
  roles,
  currentRole,
  onAssign,
  onClose,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState(
    roles.find((r) => r.role_name === currentRole)?.id || "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoleId) {
      onAssign(userId, selectedRoleId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4">Change Role</h3>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Role
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))}
          </select>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;
