import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { procurementService } from "../../services";
import { ProcurementSupplier } from "../../data/type";
import { Button } from "../../components/Buttons";
import { SupplierModal } from "../../components/Modals";
import Table, { Column } from "../../components/Table"; // adjust path as needed
import { Plus, Edit, Trash2, Truck } from "lucide-react";

const SuppliersTab: React.FC<{ businessId: string }> = ({ businessId }) => {
  const {
    data: suppliers,
    loading,
    request: fetchSuppliers,
  } = useAPI(() => procurementService.getSuppliers(businessId));
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<ProcurementSupplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSave = async (supplier: Partial<ProcurementSupplier>) => {
    if (supplier.id) {
      await procurementService.updateSupplier(supplier.id, supplier);
    } else {
      await procurementService.createSupplier(businessId, supplier as any);
    }
    fetchSuppliers();
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    await procurementService.deleteSupplier(id);
    fetchSuppliers();
  };

  // Column definitions for the Table component
  const columns: Column<ProcurementSupplier>[] = [
    {
      header: "Name",
      accessor: (row) => (
        <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
          {row.supplier_name}
        </span>
      ),
    },
    {
      header: "Contact",
      accessor: (row) => row.contact_name || "—",
      className: "text-gray-600 dark:text-gray-300 whitespace-nowrap",
    },
    {
      header: "Email",
      accessor: (row) => row.email || "—",
      className: "text-gray-600 dark:text-gray-300 whitespace-nowrap",
    },
    {
      header: "Phone",
      accessor: (row) => row.phone || "—",
      className: "text-gray-600 dark:text-gray-300 whitespace-nowrap",
    },
    {
      header: "Status",
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-sm py-xs rounded-full text-xs font-medium ${
            row.status === "active"
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              row.status === "active"
                ? "bg-green-500"
                : "bg-gray-400 dark:bg-gray-500"
            }`}
          />
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-sm">
          <button
            onClick={() => {
              setEditingSupplier(row);
              setShowModal(true);
            }}
            className="p-sm text-gray-500 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id!)}
            className="p-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: "text-right whitespace-nowrap",
    },
  ];

  return (
    <div className="space-y-md">
      {/* Header with Add button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingSupplier(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-xs" />
          Add Supplier
        </Button>
      </div>
      <Table
        columns={columns}
        data={suppliers || []}
        loading={loading} // loading handled by Table's built-in skeleton
        emptyMessage="No suppliers found"
      />
      {/* Table or Empty State */}
      {!loading && (!suppliers || suppliers.length === 0) && (
        <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-3xl px-lg text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-lg">
            <Truck className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          {loading ? (
            <div className="spin"></div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-xs">
                No suppliers yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-lg">
                Add your first supplier to start creating purchase orders
              </p>
            </>
          )}
        </div>
      )}

      {/* Supplier Modal */}
      {showModal && (
        <SupplierModal
          supplier={editingSupplier}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SuppliersTab;
