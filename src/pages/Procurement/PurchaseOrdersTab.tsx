import React, { useEffect, useState } from "react";
import { Plus, Eye, CheckCircle, ListFilter, ChevronDown } from "lucide-react";

import { useAPI } from "../../hooks/useAPI";
import { procurementService } from "../../services";
import { Button } from "../../components/Buttons";
import { CreatePOModal } from "../../components/Modals";
import Dropdown, { DropdownOption } from "../../components/Dropdown";
import Table, { Column } from "../../components/Table";

const statusOptions: DropdownOption[] = [
  { label: "All Statuses", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Ordered", value: "ordered" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
];

const PurchaseOrdersTab: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const {
    data: orders,
    loading,
    request: fetchOrders,
  } = useAPI((filters?: { status?: string; supplierId?: string }) =>
    procurementService.getPurchaseOrders(businessId, filters),
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchOrders({ status: filterStatus || undefined });
  }, [filterStatus]);

  const handleReceive = async (poId: string) => {
    if (!confirm("Mark this PO as received? Inventory will be updated."))
      return;
    await procurementService.receivePurchaseOrder(poId);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
      ordered:
        "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      received:
        "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      cancelled: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}
      >
        {status}
      </span>
    );
  };

  const columns: Column<any>[] = [
    {
      header: "PO Number",
      accessor: (row) => (
        <span className="font-mono text-textPrimary">{row.po_number}</span>
      ),
    },
    {
      header: "Supplier",
      accessor: (row) => row.supplier?.supplier_name || "—",
    },
    {
      header: "Order Date",
      accessor: (row) => new Date(row.order_date).toLocaleDateString(),
    },
    {
      header: "Expected",
      accessor: (row) =>
        row.expected_date
          ? new Date(row.expected_date).toLocaleDateString()
          : "—",
    },
    {
      header: "Total",
      accessor: (row) => (
        <span className="font-medium text-textPrimary">
          ${row.total_amount.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-sm">
          {row.status === "ordered" && (
            <button
              onClick={() => handleReceive(row.id)}
              className="p-sm text-textSecondary hover:text-success hover:bg-surfaceLight rounded-lg transition"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button className="p-sm text-textSecondary hover:text-primary hover:bg-surfaceLight rounded-lg transition">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-end gap-sm">
        <Dropdown
          options={statusOptions}
          value={filterStatus}
          onChange={setFilterStatus}
          placeholder="Filter by status"
          className="w-40"
          renderTrigger={(selected) => (
            <div className="flex items-center gap-xs px-md py-sm bg-surface border border-border rounded-lg cursor-pointer hover:bg-surfaceLight transition">
              <ListFilter className="w-4 h-4 text-textSecondary" />
              <span className="text-sm text-textPrimary">
                {selected?.label || "All Statuses"}
              </span>
              <ChevronDown className="w-4 h-4 text-textMuted" />
            </div>
          )}
        />

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-xs" />
          Create PO
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={orders || []}
        loading={loading}
        emptyMessage={
          filterStatus
            ? `No orders with status "${filterStatus}"`
            : "No purchase orders found"
        }
      />

      {/* Empty CTA */}
      {!loading && (!orders || orders.length === 0) && !filterStatus && (
        <div className="text-center mt-md">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-xs" />
            Create PO
          </Button>
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreatePOModal
          businessId={businessId}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            fetchOrders();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersTab;
