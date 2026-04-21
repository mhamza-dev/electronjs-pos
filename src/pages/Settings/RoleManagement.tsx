import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { rbacService } from "../../services";
import { AuthRole } from "../../data/type";
import { Button } from "../../components/Buttons";
import { PermissionModal, RoleFormModal } from "../../components/Modals";

const RoleManagement: React.FC<{ businessId: string }> = ({ businessId }) => {
  const { data: roles, request: fetchRoles } = useAPI(() =>
    rbacService.getRoles(businessId),
  );
  const { data: permissions, request: fetchPermissions } = useAPI(
    rbacService.getAllPermissions,
  );
  const [editingRole, setEditingRole] = useState<AuthRole | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  console.log("Permissions ->", permissions);

  const handleSaveRole = async (role: Partial<AuthRole>) => {
    if (role.id) {
      await rbacService.updateRole(role.id, {
        role_name: role.role_name!,
        description: role.description,
      });
    } else {
      await rbacService.createRole(businessId, {
        role_name: role.role_name!,
        description: role.description!,
      });
    }
    fetchRoles();
    setEditingRole(null);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Roles & Permissions</h2>
        <Button
          onClick={() =>
            setEditingRole({
              id: "",
              business_id: businessId,
              role_name: "",
              description: "",
              is_system_role: false,
            } as AuthRole)
          }
        >
          New Role
        </Button>
      </div>
      <div className="space-y-4">
        {roles?.map((role) => (
          <div
            key={role.id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{role.role_name}</h3>
              <p className="text-sm text-gray-500">{role.description}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setEditingRole(role);
                  setShowPermissionModal(true);
                }}
                className="text-primary"
              >
                Permissions
              </button>
              <button
                onClick={() => setEditingRole(role)}
                className="text-gray-600"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      {editingRole && !showPermissionModal && (
        <RoleFormModal
          role={editingRole}
          onSave={handleSaveRole}
          onClose={() => setEditingRole(null)}
        />
      )}
      {showPermissionModal && editingRole && (
        <PermissionModal
          role={editingRole}
          permissions={permissions || []}
          onClose={() => {
            setShowPermissionModal(false);
            setEditingRole(null);
          }}
          onUpdate={fetchRoles}
        />
      )}
    </div>
  );
};

export default RoleManagement;
