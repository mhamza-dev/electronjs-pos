import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { employeeService, rbacService } from "../../services";
import { Employee } from "../../data/type";
import { Button } from "../../components/Buttons";
import { RoleAssignmentModal } from "../../components/Modals";
import InviteUserModal from "../../components/Modals/InviteUserModal";
import { UserPlus, Lock, Trash } from "lucide-react";

const UserManagement: React.FC<{ businessId: string }> = ({ businessId }) => {
  const {
    data: employees,
    loading: fetching,
    request: fetchEmployees,
  } = useAPI(() => employeeService.getEmployees(businessId));

  const { request: removeAccess } = useAPI(employeeService.removeAccess);

  const { data: roles, request: fetchRoles } = useAPI(() =>
    rbacService.getRoles(businessId),
  );

  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, [businessId]);

  const handleRoleChange = async (values: { role_id: string }) => {
    if (!selectedUser) return;
    await rbacService.assignRoleToUser(
      businessId,
      selectedUser.id,
      values.role_id,
      selectedUser.id,
    );
    fetchEmployees();
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handleRemove = async (userId: string) => {
    if (
      !confirm("Remove this employee? They will lose access to this business.")
    )
      return;
    await removeAccess(userId, businessId);
    fetchEmployees();
  };

  // Loading skeleton
  if (fetching && !employees) {
    return (
      <div className="space-y-lg">
        <div className="space-y-xs">
          <div className="h-7 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-md space-y-sm">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-xs">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Employees
          </h2>
          <p className="text-sm text-gray-500">
            Manage people who have access to this business
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            /* TODO: open invite modal */
            setShowInviteModal(true);
          }}
          className="shadow-sm flex items-center gap-xs"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {employees && employees.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-lg py-md text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-medium text-sm">
                        {emp.full_name?.charAt(0) ||
                          emp.email?.charAt(0) ||
                          "?"}
                      </div>
                      <span className="font-medium text-gray-900">
                        {emp.full_name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-gray-600">
                    {emp.email || "—"}
                  </td>
                  <td className="px-lg py-md">
                    <span className="inline-flex items-center px-sm py-xs rounded-full text-xs font-medium bg-secondary-50 text-secondary-700">
                      {emp.role || "No role"}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <span
                      className={`inline-flex items-center px-sm py-xs rounded-full text-xs font-medium ${
                        emp.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          emp.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex items-center justify-end gap-sm">
                      <button
                        onClick={() => {
                          setSelectedUser(emp);
                          setShowRoleModal(true);
                        }}
                        className="inline-flex items-center px-sm py-xs text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-md transition-colors gap-xs"
                      >
                        <Lock className="w-4 h-4" />
                        Role
                      </button>
                      <button
                        onClick={() => handleRemove(emp.id)}
                        className="inline-flex items-center px-sm py-xs text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Empty State */
          <div className="py-3xl px-lg text-center">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-xs">
              No employees yet
            </h3>
            <p className="text-gray-500 mb-lg">
              Invite team members to start collaborating
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                /* open invite modal */
                setShowInviteModal(true);
              }}
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Invite First Employee
            </Button>
          </div>
        )}
      </div>
      {showInviteModal && (
        <InviteUserModal
          businessId={businessId}
          roles={roles || []}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            fetchEmployees();
            setShowInviteModal(false);
          }}
        />
      )}
      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <RoleAssignmentModal
          selectedUser={selectedUser}
          roles={roles || []}
          onAssign={handleRoleChange}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
