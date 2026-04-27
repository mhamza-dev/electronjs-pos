import React, { useEffect } from "react";
import { listPurchasesByBusiness } from "../../services/purchaseService";
import { Purchase } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { useApi } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const PurchasesPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { data, error, loading, request } = useApi<Purchase[]>(
    listPurchasesByBusiness,
  );

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const columns: Column<Purchase>[] = [
    { header: "ID", accessor: "id" },
    { header: "Total", accessor: (row) => `$${row.total.toFixed(2)}` },
    { header: "Status", accessor: "status" },
    {
      header: "Created",
      accessor: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Purchases</h2>
      <Table
        columns={columns}
        data={data || []}
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default PurchasesPage;
