import React, { useEffect } from "react";
import { listUserProfilesByBusiness } from "../../services/userProfileService";
import { UserProfile } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { useApi } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const EmployeesPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { data, error, loading, request } = useApi<UserProfile[]>(
    listUserProfilesByBusiness,
  );

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const columns: Column<UserProfile>[] = [
    { header: "Full Name", accessor: (row) => row.full_name || "—" },
    { header: "Role", accessor: "role" },
    { header: "Active", accessor: (row) => (row.is_active ? "Yes" : "No") },
    { header: "Phone", accessor: (row) => row.phone || "—" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Employees</h2>
      <Table
        columns={columns}
        data={data || []}
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default EmployeesPage;
