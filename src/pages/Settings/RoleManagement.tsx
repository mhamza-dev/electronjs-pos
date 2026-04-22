import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { rbacService } from "../../services";
import { AuthRole } from "../../data/type";
import { Button } from "../../components/Buttons";
import { PermissionModal, RoleFormModal } from "../../components/Modals";

const RoleManagement: React.FC<{ businessId: string }> = ({ businessId }) => {
  const {
    data: roles,
    loading,
    request: fetchRoles,
  } = useAPI(() => rbacService.getRoles(businessId));
  const { data: permissions, request: fetchPermissions } = useAPI(
    rbacService.getAllPermissions,
  );
  const [editingRole, setEditingRole] = useState<AuthRole | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [businessId]);

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

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    await rbacService.deleteRole(roleId);
    fetchRoles();
  };

  if (loading && !roles) {
    return (
      <div className="flex items-center justify-center py-3xl">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-xs">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Roles & Permissions
          </h2>
          <p className="text-sm text-gray-500">
            Manage what each role can access within your business
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() =>
            setEditingRole({
              id: "",
              business_id: businessId,
              role_name: "",
              description: "",
              is_system_role: false,
              created_at: "",
              updated_at: "",
            } as AuthRole)
          }
          className="shadow-sm"
        >
          <svg
            className="w-4 h-4 mr-xs"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Role
        </Button>
      </div>

      {/* Info Alert for System Roles */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-md flex items-start gap-sm">
        <svg
          className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-secondary-800">System Roles</p>
          <p className="text-xs text-secondary-600 mt-0.5">
            Roles marked as system roles cannot be deleted. They provide
            essential functionality.
          </p>
        </div>
      </div>

      {/* Roles Grid */}
      {roles && roles.length > 0 ? (
        <div className="grid gap-md">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white border border-gray-200 rounded-xl p-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-md">
                {/* Role Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-sm flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {role.role_name}
                    </h3>
                    {role.is_system_role && (
                      <span className="inline-flex items-center px-sm py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-xs line-clamp-2">
                    {role.description || "No description provided"}
                  </p>
                  <p className="text-xs text-gray-400 mt-sm">
                    Created {new Date(role.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-xs flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingRole(role);
                      setShowPermissionModal(true);
                    }}
                    className="inline-flex items-center px-md py-sm text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors"
                    title="Manage permissions"
                  >
                    <svg
                      className="w-4 h-4 mr-xs"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Permissions
                  </button>

                  <button
                    onClick={() => setEditingRole(role)}
                    className="inline-flex items-center px-md py-sm text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit role"
                  >
                    <svg
                      className="w-4 h-4 mr-xs"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>

                  {!role.is_system_role && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="inline-flex items-center px-md py-sm text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete role"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl py-3xl px-lg text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-lg">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-xs">
            No roles yet
          </h3>
          <p className="text-gray-500 mb-lg">
            Create your first role to start managing permissions
          </p>
          <Button
            variant="primary"
            onClick={() =>
              setEditingRole({
                id: "",
                business_id: businessId,
                role_name: "",
                description: "",
                is_system_role: false,
                created_at: "",
                updated_at: "",
              } as AuthRole)
            }
          >
            <svg
              className="w-4 h-4 mr-xs"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create First Role
          </Button>
        </div>
      )}

      {/* Modals */}
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
