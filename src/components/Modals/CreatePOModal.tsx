import { useState } from "react";
import { catalogService, procurementService } from "../../services";
import { useAPI } from "../../hooks/useAPI";
import { Button } from "../Buttons";

const CreatePOModal: React.FC<{
  businessId: string;
  onClose: () => void;
  onCreated: () => void;
}> = ({ businessId, onClose, onCreated }) => {
  const { data: suppliers } = useAPI(() =>
    procurementService.getSuppliers(businessId),
  );
  const { data: products } = useAPI(() =>
    catalogService.getProducts(businessId, { isActive: true }),
  );
  const { request: createPO, loading } = useAPI(
    procurementService.createPurchaseOrder,
  );

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [items, setItems] = useState<
    Array<{ product_id: string; quantity: number; unit_cost: number }>
  >([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || items.length === 0)
      return alert("Please select supplier and add items");
    await createPO(businessId, {
      supplier_id: selectedSupplier,
      expected_date: expectedDate || undefined,
      items,
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-7xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">Create Purchase Order</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select supplier</option>
                {suppliers?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.supplier_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expected Date
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="border rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Add Items</h4>
            <div className="grid grid-cols-4 gap-2 items-end">
              <div className="col-span-2">
                <label className="block text-xs mb-1">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select product</option>
                  {products?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} (Cost: ${p.cost_price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  placeholder="Auto"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <Button type="button" onClick={handleAddItem}>
                  Add
                </Button>
              </div>
            </div>
          </div>
          {items.length > 0 && (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Unit Cost</th>
                  <th className="text-right py-2">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const product = products?.find(
                    (p) => p.id === item.product_id,
                  );
                  return (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{product?.product_name}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">
                        ${item.unit_cost.toFixed(2)}
                      </td>
                      <td className="text-right">
                        ${(item.quantity * item.unit_cost).toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-6 border-t flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Create PO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePOModal;
