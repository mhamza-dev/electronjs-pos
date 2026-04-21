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

  //   const handleToggle = (permId: string) => {
  //     setSelected((prev) => {
  //       const next = new Set(prev);
  //       if (next.has(permId)) next.delete(permId);
  //       else next.add(permId);
  //       return next;
  //     });
  //   };

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
      <div className="bg-white rounded-xl shadow-xl width-container-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">
            Permissions for {role.role_name}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">Loading...</div>
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
              <div className="p-6 border-t flex justify-end space-x-3">
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
