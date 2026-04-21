import React, { useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { procurementService } from "../../services";
import { Button } from "../../components/Buttons";
import { CreatePOModal } from "../../components/Modals";

const PurchaseOrdersTab: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const { data: orders, request: fetchOrders } = useAPI(() =>
    procurementService.getPurchaseOrders(businessId),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");

  //   useEffect(() => {
  //     fetchOrders({ status: filterStatus || undefined });
  //   }, [filterStatus]);

  const handleReceive = async (poId: string) => {
    if (!confirm("Mark this PO as received? Inventory will be updated."))
      return;
    await procurementService.receivePurchaseOrder(poId);
    fetchOrders();
  };

  const filteredOrders = orders || [];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Purchase Orders</h2>
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button onClick={() => setShowCreateModal(true)}>Create PO</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                PO Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Expected
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
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
            {filteredOrders.map((po) => (
              <tr key={po.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono">
                  {po.po_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {po.supplier?.supplier_name || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(po.order_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {po.expected_date
                    ? new Date(po.expected_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${po.total_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      po.status === "received"
                        ? "bg-green-100 text-green-800"
                        : po.status === "ordered"
                          ? "bg-blue-100 text-blue-800"
                          : po.status === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {po.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {po.status === "ordered" && (
                    <button
                      onClick={() => handleReceive(po.id)}
                      className="text-primary hover:underline mr-3"
                    >
                      Receive
                    </button>
                  )}
                  <button className="text-gray-600 hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
