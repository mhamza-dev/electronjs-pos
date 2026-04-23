import React, { useEffect, useState } from "react";
import { Button } from "../../components/Buttons";
import { rbacService } from "../../services";
import { useAPI } from "../../hooks/useAPI";
import { AuthPermission, AuthRole } from "../../data/type";
import { Form } from "../Form";
import { MultiSelectInput } from "../Inputs";

interface PermissionModalProps {
  role: AuthRole;
  permissions: AuthPermission[];
  onClose: () => void;
  onUpdate: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  role,
  permissions,
  onClose,
  onUpdate,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { request: fetchRolePerms, loading } = useAPI(
    rbacService.getRolePermissions,
  );
  const { request: assignPerm } = useAPI(rbacService.assignPermissionToRole);
  const { request: removePerm } = useAPI(rbacService.removePermissionFromRole);

  useEffect(() => {
    const load = async () => {
      const perms = await fetchRolePerms(role.id);
      setSelected(new Set(perms.map((p) => p.id)));
    };
    load();
  }, [role.id]);

  const handleSave = async () => {
    // Determine changes
    const current = await fetchRolePerms(role.id);
    const currentIds = new Set(current.map((p) => p.id));
    const toAdd = Array.from(selected).filter((id) => !currentIds.has(id));
    const toRemove = Array.from(currentIds).filter((id) => !selected.has(id));

    await Promise.all([
      ...toAdd.map((permId) => assignPerm(role.business_id, role.id, permId)),
      ...toRemove.map((permId) => removePerm(role.id, permId)),
    ]);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-7xl min-w-5xl max-h-[80vh] overflow-y-auto p-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Permissions for {role.role_name}
          </h3>
        </div>
        <div className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8 text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <Form
              initialValues={{ permissions: Array.from(selected) }}
              onSubmit={handleSave}
            >
              <MultiSelectInput
                name="permissions"
                label="Permissions"
                options={permissions.map((p) => ({
                  label: p.permission_key,
                  value: p.id,
                }))}
              />
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
