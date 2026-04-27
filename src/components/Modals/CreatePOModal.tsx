import { useState } from "react";
import * as yup from "yup";
import { Form } from "../../components/Form";
import { SelectInput, TextInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { catalogService, procurementService } from "../../services";
import { useAPI } from "../../hooks/useApi";
import { Trash2 } from "lucide-react";

interface CreatePOModalProps {
  businessId: string;
  onClose: () => void;
  onCreated: () => void;
}

interface POItem {
  product_id: string;
  quantity: number;
  unit_cost: number;
}

const validationSchema = yup.object({
  supplier_id: yup.string().required("Supplier is required"),
  expected_date: yup.string().nullable(),
});

const CreatePOModal: React.FC<CreatePOModalProps> = ({
  businessId,
  onClose,
  onCreated,
}) => {
  const { data: suppliers } = useAPI(() =>
    procurementService.getSuppliers(businessId),
  );
  const { data: products } = useAPI(() =>
    catalogService.getProducts(businessId, { isActive: true }),
  );
  const { request: createPO, loading } = useAPI(
    procurementService.createPurchaseOrder,
  );

  const [items, setItems] = useState<POItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;
    const product = products?.find((p) => p.id === selectedProduct);
    if (!product) return;
    setItems([
      ...items,
      {
        product_id: product.id,
        quantity,
        unit_cost: unitCost || product.cost_price || 0,
      },
    ]);
    setSelectedProduct("");
    setQuantity(1);
    setUnitCost(0);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (values: {
    supplier_id: string;
    expected_date: string;
  }) => {
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }
    await createPO(businessId, {
      supplier_id: values.supplier_id,
      expected_date: values.expected_date || undefined,
      items,
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Create Purchase Order
          </h3>
        </div>

        <Form
          initialValues={{
            supplier_id: "",
            expected_date: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <SelectInput
                    name="supplier_id"
                    label="Supplier"
                    options={
                      suppliers?.map((s) => ({
                        label: s.supplier_name,
                        value: s.id,
                      })) || []
                    }
                    required
                  />
                  <TextInput
                    name="expected_date"
                    label="Expected Date"
                    type="date"
                  />
                </div>

                {/* Add Items Section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Add Items
                  </h4>
                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div className="col-span-2">
                      {/* SelectInput already has label, but we keep the wrapper */}
                      <SelectInput
                        name="product_id"
                        label="Product"
                        options={
                          products?.map((p) => ({
                            label: `${p.product_name} (Cost: ${p.cost_price?.toFixed(2)})`,
                            value: p.id,
                          })) || []
                        }
                      />
                    </div>
                    <TextInput
                      label="Quantity"
                      name="quantity"
                      type="number"
                      min="1"
                    />
                    <TextInput
                      label="Unit Cost"
                      name="unit_cost"
                      type="number"
                      min="1"
                    />
                    <div>
                      <Button type="button" onClick={handleAddItem} size="sm">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                {items.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Product
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
                            Unit Cost
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
                            Total
                          </th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-900 dark:text-gray-100">
                        {items.map((item, idx) => {
                          const product = products?.find(
                            (p) => p.id === item.product_id,
                          );
                          return (
                            <tr key={idx}>
                              <td className="px-4 py-3">
                                {product?.product_name}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-right">
                                ${item.unit_cost.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                ${(item.quantity * item.unit_cost).toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  Create PO
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
};

export default CreatePOModal;
