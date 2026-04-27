import React, { useEffect } from "react";
import { listTablesByBusiness } from "../../services/restaurantService";
import { RestaurantTable } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { useApi } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const RestaurantPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { data, error, loading, request } =
    useApi<RestaurantTable[]>(listTablesByBusiness);

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const columns: Column<RestaurantTable>[] = [
    { header: "Table #", accessor: "table_number" },
    { header: "Capacity", accessor: (row) => row.capacity ?? "—" },
    { header: "Status", accessor: "status" },
    { header: "Branch", accessor: "branch_id" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Restaurant Tables</h2>
      <Table
        columns={columns}
        data={data || []}
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default RestaurantPage;
