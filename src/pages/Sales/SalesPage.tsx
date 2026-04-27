import React, { useEffect } from "react";
import { listSalesByBusiness } from "../../services/saleService";
import { Sale } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { useApi } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const SalesPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { data, error, loading, request } = useApi<Sale[]>(listSalesByBusiness);

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const columns: Column<Sale>[] = [
    { header: "ID", accessor: "id" },
    { header: "Total", accessor: (row) => `$${row.total.toFixed(2)}` },
    { header: "Subtotal", accessor: (row) => `$${row.subtotal.toFixed(2)}` },
    {
      header: "Date",
      accessor: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sales</h2>
      <Table
        columns={columns}
        data={data || []}
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default SalesPage;
