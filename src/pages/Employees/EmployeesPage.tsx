import React, { useEffect, useState } from "react";
import { Button } from "../../components/Buttons";
import { useAuth } from "../../contexts/AuthContext";
import { employeeService } from "../../services";
import { useAPI } from "../../hooks/useAPI";
import { Employee } from "../../data/type";

const EmployeesPage: React.FC = () => {
  const { profile } = useAuth();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: employees,
    loading,
    request: fetchEmployees,
  } = useAPI(employeeService.getEmployees);

  const { loading: deleteLoading, request: removeAccess } = useAPI(
    employeeService.removeAccess,
  );

  useEffect(() => {
    if (profile?.current_business_id) {
      fetchEmployees(profile.current_business_id);
    }
  }, [profile]);

  const handleDelete = async (employee: Employee) => {
    // Prevent admin from deleting themselves
    if (employee.id === profile?.id) {
      alert("You cannot delete your own account while logged in.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove ${employee.full_name || employee.email}?`,
      )
    ) {
      return;
    }

    try {
      await removeAccess(employee.id, profile!.current_business_id!);
      await fetchEmployees(profile!.current_business_id!);
      setDeleteError(null);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to remove employee.");
      alert(err.message || "Failed to remove employee.");
    }
  };

  const handleAddEmployee = () => {
    // TODO: Open modal for adding employee (invite user or create new)
    alert("Add employee modal will be implemented.");
  };

  const isAdmin = profile?.business_users?.some(
    (bu) => bu.role?.role_name === "admin",
  );

  return (
    <div className="flex flex-col space-y-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 font-poppins">
          Employees Management
        </h2>
        <div className="flex space-x-md">
          <Button variant="secondary">Import CSV</Button>
          <Button variant="primary" onClick={handleAddEmployee}>
            <svg
              className="w-5 h-5 mr-xs"
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
            Add New Employee
          </Button>
        </div>
      </div>

      {deleteError && (
        <div className="bg-red-50 text-red-600 p-md rounded-lg text-sm">
          {deleteError}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden min-h-[200px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-xl">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-lg py-md">Name</th>
                <th className="px-lg py-md">Role</th>
                <th className="px-lg py-md">Email</th>
                <th className="px-lg py-md">Status</th>
                <th className="px-lg py-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {employees && employees.length > 0 ? (
                employees.map((emp: Employee) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-lg py-md font-bold">
                      {emp.full_name || "Unnamed"}
                    </td>
                    <td className="px-lg py-md capitalize">
                      {emp.role || "—"}
                    </td>
                    <td className="px-lg py-md">{emp.email || "No email"}</td>
                    <td className="px-lg py-md">
                      <span
                        className={`px-sm py-xs rounded-full text-xs font-bold ${
                          emp.status === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {emp.status || "active"}
                      </span>
                    </td>
                    <td className="px-lg py-md text-right">
                      <div className="flex justify-end space-x-sm">
                        {isAdmin && (
                          <>
                            <Button
                              variant="inverted"
                              className="px-sm py-xs text-xs"
                              onClick={() => alert("Edit not implemented yet")}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              className="px-sm py-xs text-xs"
                              onClick={() => handleDelete(emp)}
                              loading={deleteLoading}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {!isAdmin && (
                          <span className="text-gray-400 text-xs">
                            No actions
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-xl text-gray-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
