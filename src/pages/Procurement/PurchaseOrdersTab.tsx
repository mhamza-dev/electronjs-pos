import React, { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  CheckCircle,
  Package,
  ListFilter,
  ChevronDown,
} from "lucide-react";

import { useAPI } from "../../hooks/useAPI";
import { procurementService } from "../../services";
import { Button } from "../../components/Buttons";
import { CreatePOModal } from "../../components/Modals";
import Dropdown, { DropdownOption } from "../../components/Dropdown";

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

  const filteredOrders = orders || [];

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-gray-100 text-gray-600 border-gray-200",
      ordered: "bg-blue-50 text-blue-700 border-blue-200",
      received: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    const dots = {
      draft: "bg-gray-400",
      ordered: "bg-blue-500",
      received: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return (
      <span
        className={`inline-flex items-center px-sm py-xs rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.draft}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dots[status as keyof typeof dots] || dots.draft}`}
        />
        {status}
      </span>
    );
  };

  // Loading skeleton
  if (loading && !orders) {
    return (
      <div className="space-y-md">
        <div className="flex justify-end gap-sm">
          <div className="h-9 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-9 bg-gray-200 rounded w-28 animate-pulse" />
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
    <div className="space-y-md">
      {/* Header with Filter and Create Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-sm">
        <Dropdown
          options={statusOptions}
          value={filterStatus}
          onChange={setFilterStatus}
          placeholder="Filter by status"
          className="w-40"
          renderTrigger={(selected) => (
            <div className="flex items-center gap-xs px-md py-sm bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <ListFilter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">
                {selected?.label || "All Statuses"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
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

      {/* Purchase Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px] md:min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
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
                {filteredOrders.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-lg py-md font-mono text-sm text-gray-900 whitespace-nowrap">
                      {po.po_number}
                    </td>
                    <td className="px-lg py-md text-gray-600 whitespace-nowrap">
                      {po.supplier?.supplier_name || "—"}
                    </td>
                    <td className="px-lg py-md text-gray-600 whitespace-nowrap">
                      {new Date(po.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-lg py-md text-gray-600 whitespace-nowrap">
                      {po.expected_date
                        ? new Date(po.expected_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-lg py-md font-medium text-gray-900 whitespace-nowrap">
                      ${po.total_amount.toFixed(2)}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="px-lg py-md text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-sm">
                        {po.status === "ordered" && (
                          <button
                            onClick={() => handleReceive(po.id)}
                            className="p-sm text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Receive"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-sm text-gray-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl py-3xl px-lg text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-lg">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-xs">
            No purchase orders found
          </h3>
          <p className="text-gray-500 mb-lg">
            {filterStatus
              ? `No orders with status "${filterStatus}"`
              : "Create your first purchase order to get started"}
          </p>
          {!filterStatus && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-xs" />
              Create PO
            </Button>
          )}
        </div>
      )}

      {/* Create PO Modal */}
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
