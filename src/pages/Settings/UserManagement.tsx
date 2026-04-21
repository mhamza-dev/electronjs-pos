import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { employeeService, rbacService } from "../../services";
import { Employee } from "../../data/type";
import { Button } from "../../components/Buttons";
import { RoleAssignmentModal } from "../../components/Modals";

const UserManagement: React.FC<{ businessId: string }> = ({ businessId }) => {
  const {
    data: employees,
    loading,
    request: fetchEmployees,
  } = useAPI(() => employeeService.getEmployees(businessId));
  const { request: removeAccess } = useAPI(employeeService.removeAccess);
  const { data: roles } = useAPI(() => rbacService.getRoles(businessId));
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [businessId]);

  const handleRoleChange = async (userId: string, roleId: string) => {
    await rbacService.assignRoleToUser(
      businessId,
      userId,
      roleId,
      selectedUser!.id,
    );
    fetchEmployees();
    setShowRoleModal(false);
  };

  if (loading) return <div>Loading employees...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employees</h2>
        <Button
          onClick={() => {
            /* open invite modal */
          }}
        >
          Invite User
        </Button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees?.map((emp) => (
            <tr key={emp.id}>
              <td className="px-6 py-4 whitespace-nowrap">{emp.full_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{emp.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{emp.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">{emp.status}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => {
                    setSelectedUser(emp);
                    setShowRoleModal(true);
                  }}
                  className="text-primary hover:underline mr-2"
                >
                  Change Role
                </button>
                <button
                  onClick={() =>
                    removeAccess(emp.id, businessId).then(fetchEmployees)
                  }
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showRoleModal && selectedUser && (
        <RoleAssignmentModal
          userId={selectedUser.id}
          businessId={businessId}
          roles={roles || []}
          currentRole={selectedUser.role}
          onAssign={handleRoleChange}
          onClose={() => setShowRoleModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;
