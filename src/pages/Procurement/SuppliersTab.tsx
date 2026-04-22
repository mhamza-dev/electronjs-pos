import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { procurementService } from "../../services";
import { ProcurementSupplier } from "../../data/type";
import { Button } from "../../components/Buttons";
import { SupplierModal } from "../../components/Modals";
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

  // Loading skeleton
  if (loading && !suppliers) {
    return (
      <div className="space-y-md">
        <div className="flex justify-end">
          <div className="h-9 bg-gray-200 rounded w-32 animate-pulse" />
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

      {/* Suppliers Table */}
      {suppliers && suppliers.length > 0 ? (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px] md:min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-lg py-md text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
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
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-lg py-md font-medium text-gray-900 whitespace-nowrap">
                      {s.supplier_name}
                    </td>
                    <td className="px-lg py-md text-gray-600 whitespace-nowrap">
                      {s.contact_name || "—"}
                    </td>
                    <td className="px-lg py-md text-gray-600 whitespace-nowrap">
                      {s.email || "—"}
                    </td>
                    <td className="px-lg py-md text-gray-600 whitespace-nowrap">
                      {s.phone || "—"}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-sm py-xs rounded-full text-xs font-medium ${
                          s.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            s.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-lg py-md text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-sm">
                        <button
                          onClick={() => {
                            setEditingSupplier(s);
                            setShowModal(true);
                          }}
                          className="p-sm text-gray-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
            <Truck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-xs">
            No suppliers yet
          </h3>
          <p className="text-gray-500 mb-lg">
            Add your first supplier to start creating purchase orders
          </p>
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
