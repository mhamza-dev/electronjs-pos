import React, { useEffect, useState } from "react";
import {
  listDealsByBusiness,
  createDeal,
  updateDeal,
  softDeleteDeal,
} from "../../services/servicePackageDealService";
import { Deal, DealInsert } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { Button } from "../../components/Buttons";
import { Form } from "../../components/Form";
import { CheckboxInput, SelectInput, TextInput } from "../../components/Inputs";
import { useApi, useAuth } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const initForm = {
  name: "",
  total_price: "",
  is_active: true,
  branch_id: "",
  business_id: "",
};

const DealsPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { profile } = useAuth();
  const { data, error, loading, request } = useApi<Deal[]>(listDealsByBusiness);
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
  const openEdit = (d: Deal) =>
    setModal({
      open: true,
      editId: d.id,
      values: {
        name: d.name,
        total_price: d.total_price ? String(d.total_price) : "",
        is_active: d.is_active ?? true,
        branch_id: d.branch_id || "",
        business_id: businessId,
      },
    });

  const handleSubmit = async (values: typeof initForm) => {
    const params = {
      ...values,
      total_price: values.total_price ? Number(values.total_price) : null,
    };
    if (modal.editId) {
      await updateDeal(modal.editId, params as DealInsert);
    } else {
      await createDeal(params as DealInsert);
    }
    setModal({ ...modal, open: false });
    request(businessId);
  };

  const columns: Column<Deal>[] = [
    { header: "Name", accessor: "name" },
    {
      header: "Total Price",
      accessor: (row) => (row.total_price ? `$${row.total_price}` : "—"),
    },
    { header: "Active", accessor: (row) => (row.is_active ? "Yes" : "No") },
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
              await softDeleteDeal(row.id);
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
        <h2 className="text-2xl font-bold">Deals</h2>
        <Button onClick={openAdd}>+ Add Deal</Button>
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
              {modal.editId ? "Edit" : "New"} Deal
            </h3>
            <Form
              initialValues={modal.values}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {() => (
                <>
                  <TextInput name="name" label="Name" required />
                  <TextInput
                    name="total_price"
                    label="Total Price"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <TextInput type="hidden" name="business_id" />
                  <SelectInput
                    name="branch_id"
                    label="Branch"
                    options={branchOptions}
                  />
                  <CheckboxInput name="is_active" label="Active" />
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

export default DealsPage;
