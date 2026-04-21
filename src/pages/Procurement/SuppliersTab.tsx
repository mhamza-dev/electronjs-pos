import React, { useEffect, useState } from "react";
import { useAPI } from "../../hooks/useAPI";
import { procurementService } from "../../services";
import { ProcurementSupplier } from "../../data/type";
import { Button } from "../../components/Buttons";
import { SupplierModal } from "../../components/Modals";

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

  if (loading)
    return <div className="text-center py-8">Loading suppliers...</div>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Suppliers</h2>
        <Button
          onClick={() => {
            setEditingSupplier(null);
            setShowModal(true);
          }}
        >
          Add Supplier
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
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
            {suppliers?.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {s.supplier_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {s.contact_name || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {s.email || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {s.phone || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${s.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setEditingSupplier(s);
                      setShowModal(true);
                    }}
                    className="text-primary hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
