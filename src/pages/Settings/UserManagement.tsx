import React, { useEffect, useMemo, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { employeeService, rbacService } from "../../services";
import { Employee } from "../../data/type";
import { Button } from "../../components/Buttons";
import { RoleAssignmentModal } from "../../components/Modals";
import InviteUserModal from "../../components/Modals/InviteUserModal";
import Table, { Column } from "../../components/Table"; // adjust import path
import { UserPlus, Lock, Trash } from "lucide-react";

const UserManagement: React.FC<{ businessId: string }> = ({ businessId }) => {
  const {
    data: employees,
    loading,
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

  // Column definitions for the Table
  const columns: Column<Employee>[] = useMemo(
    () => [
      {
        header: "Name",
        accessor: (emp) => (
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-400/20 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium text-sm">
              {emp.full_name?.charAt(0) || emp.email?.charAt(0) || "?"}
            </div>
            <span className="font-medium">{emp.full_name || "—"}</span>
          </div>
        ),
      },
      {
        header: "Email",
        accessor: (emp) => emp.email || "—",
        className: "text-gray-600 dark:text-gray-300 whitespace-nowrap",
      },
      {
        header: "Role",
        accessor: (emp) => (
          <span className="inline-flex items-center px-sm py-xs rounded-full text-xs font-medium bg-secondary-50 dark:bg-secondary-400/20 text-secondary-700 dark:text-secondary-300">
            {emp.role || "No role"}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: (emp) => (
          <span
            className={`inline-flex items-center px-sm py-xs rounded-full text-xs font-medium ${
              emp.status === "active"
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                emp.status === "active"
                  ? "bg-green-500"
                  : "bg-gray-400 dark:bg-gray-500"
              }`}
            />
            {emp.status}
          </span>
        ),
      },
      {
        header: "Actions",
        accessor: (emp) => (
          <div className="flex items-center justify-end gap-sm">
            <button
              onClick={() => {
                setSelectedUser(emp);
                setShowRoleModal(true);
              }}
              className="inline-flex items-center px-sm py-xs text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-900/30 rounded-md transition-colors gap-xs"
            >
              <Lock className="w-4 h-4" />
              Role
            </button>
            <button
              onClick={() => handleRemove(emp.id)}
              className="inline-flex items-center px-sm py-xs text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        ),
        className: "text-right whitespace-nowrap",
      },
    ],
    [handleRemove], // re-create if handleRemove reference changes (stable, but just in case)
  );

  const showCustomEmpty = !loading && employees && employees.length === 0;

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-xs">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Employees
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage people who have access to this business
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowInviteModal(true)}
          className="shadow-sm flex items-center gap-xs"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      {/* Table / Empty State */}
      {showCustomEmpty ? (
        <div className="py-3xl px-lg text-center bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-lg">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-xs">
            No employees yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-lg">
            Invite team members to start collaborating
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowInviteModal(true)}
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
      ) : (
        <Table
          columns={columns}
          data={employees || []}
          loading={loading}
          emptyMessage="No employees found"
        />
      )}

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
