import React, { useEffect, useState } from "react";
import {
  listProductsByBusiness,
  createProduct,
  updateProduct,
  softDeleteProduct,
} from "../../services/productService";
import { Product, ProductInsert } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { Button } from "../../components/Buttons";
import { Form } from "../../components/Form";
import { CheckboxInput, SelectInput, TextInput } from "../../components/Inputs";
import { useApi, useAuth } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const initForm = {
  name: "",
  sku: "",
  barcode: "",
  price: "",
  cost_price: "",
  stock_quantity: 0,
  reorder_level: 0,
  is_active: true,
  branch_id: "",
  business_id: "",
};

const InventoryPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { profile } = useAuth();
  const { data, error, loading, request } = useApi<Product[]>(
    listProductsByBusiness,
  );
  const [modal, setModal] = useState<{
    open: boolean;
    editId?: string;
    values: typeof initForm;
  }>({ open: false, values: initForm });

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const branchOptions =
    profile?.businesses?.flatMap((business) =>
      (business.branches ?? []).map((branch) => ({
        label: branch.name,
        value: branch.id,
      })),
    ) ?? [];

  const openAdd = () =>
    setModal({ open: true, values: { ...initForm, business_id: businessId } });
  const openEdit = (p: Product) =>
    setModal({
      open: true,
      editId: p.id,
      values: {
        name: p.name,
        sku: p.sku || "",
        barcode: p.barcode || "",
        price: String(p.price),
        cost_price: String(p.cost_price ?? ""),
        stock_quantity: p.stock_quantity ?? 0,
        reorder_level: p.reorder_level ?? 0,
        is_active: p.is_active ?? true,
        branch_id: p.branch_id || "",
        business_id: businessId,
      },
    });

  const handleSubmit = async (values: typeof initForm) => {
    const params = {
      ...values,
      price: Number(values.price),
      cost_price: Number(values.cost_price) || 0,
      stock_quantity: Number(values.stock_quantity),
      reorder_level: Number(values.reorder_level),
    };
    if (modal.editId) {
      await updateProduct(modal.editId, params as ProductInsert);
    } else {
      await createProduct(params as ProductInsert);
    }
    setModal({ ...modal, open: false });
    request(businessId);
  };

  const columns: Column<Product>[] = [
    { header: "Name", accessor: "name" },
    { header: "SKU", accessor: "sku" },
    { header: "Price", accessor: (row) => `$${row.price}` },
    { header: "Stock", accessor: "stock_quantity" },
    { header: "Branch", accessor: (row) => row.branch_id || "—" },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="xs" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button
            variant="dangerText"
            size="xs"
            onClick={async () => {
              await softDeleteProduct(row.id);
              request(businessId);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Products / Inventory</h2>
        <Button onClick={openAdd}>+ Add Product</Button>
      </div>
      <Table
        columns={columns}
        data={data || []}
        error={error}
        loading={loading}
      />

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {modal.editId ? "Edit" : "New"} Product
            </h3>
            <Form
              initialValues={modal.values}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {() => (
                <>
                  <TextInput name="name" label="Name" required />
                  <TextInput name="sku" label="SKU" />
                  <TextInput name="barcode" label="Barcode" />
                  <TextInput
                    name="price"
                    label="Price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                  />
                  <TextInput
                    name="cost_price"
                    label="Cost Price"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <TextInput
                    name="stock_quantity"
                    label="Stock Qty"
                    type="number"
                    min="0"
                  />
                  <TextInput
                    name="reorder_level"
                    label="Reorder Level"
                    type="number"
                    min="0"
                  />
                  <SelectInput
                    name="branch_id"
                    label="Branch"
                    options={branchOptions}
                  />
                  <CheckboxInput name="is_active" label="Active" />
                  <TextInput type="hidden" name="business_id" />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setModal({ ...modal, open: false })}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" inForm>
                      Save
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
