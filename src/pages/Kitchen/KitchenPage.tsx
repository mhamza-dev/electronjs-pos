import React, { useEffect } from "react";
import { listKitchenOrdersByBusiness } from "../../services/restaurantService";
import { KitchenOrder } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { useApi } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const KitchenPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { data, error, loading, request } = useApi<KitchenOrder[]>(
    listKitchenOrdersByBusiness,
  );

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const columns: Column<KitchenOrder>[] = [
    { header: "Table", accessor: "table_id" },
    { header: "Sale", accessor: "sale_id" },
    { header: "Status", accessor: "status" },
    { header: "Priority", accessor: "priority" },
    {
      header: "Created",
      accessor: (row) => new Date(row.created_at).toLocaleString(),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Kitchen Orders</h2>
      <Table
        columns={columns}
        data={data || []}
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default KitchenPage;
