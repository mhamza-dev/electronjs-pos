import React, { useEffect, useState } from "react";
import {
  listServicesByBusiness,
  createService,
  updateService,
  softDeleteService,
} from "../../services/servicePackageDealService";
import { Service, ServiceInsert } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { Button } from "../../components/Buttons";
import { Form } from "../../components/Form";
import { CheckboxInput, SelectInput, TextInput } from "../../components/Inputs";
import { useApi, useAuth } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const initForm = {
  name: "",
  price: "",
  duration_minutes: "",
  is_active: true,
  branch_id: "",
  business_id: "",
};

const ServicesPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { profile } = useAuth();
  const { data, error, loading } = useApi<Service[]>(listServicesByBusiness);
  const [modal, setModal] = useState<{
    open: boolean;
    editId?: string;
    values: typeof initForm;
  }>({ open: false, values: initForm });

  useEffect(() => {
    listServicesByBusiness(businessId);
  }, [businessId]);

  const branchOptions =
    profile?.businesses?.flatMap((business) =>
      (business.branches ?? []).map((branch) => ({
        label: branch.name,
        value: branch.id,
      })),
    ) ?? [];

  const openAdd = () => setModal({ open: true, values: initForm });
  const openEdit = (c: Service) =>
    setModal({
      open: true,
      editId: c.id,
      values: {
        name: c.name,
        price: String(c.price) || "",
        duration_minutes: String(c.duration_minutes) || "",
        is_active: c.is_active || true,
        branch_id: c.branch_id || "",
        business_id: businessId,
      },
    });

  const handleSubmit = async (values: typeof initForm) => {
    const params = {
      ...values,
      price: Number(values.price),
      duration_minutes: Number(values.duration_minutes),
    };
    if (!businessId) return;
    if (modal.editId) {
      await updateService(modal.editId, params as ServiceInsert);
    } else {
      await createService(params as ServiceInsert);
    }
    setModal({ ...modal, open: false });
    listServicesByBusiness(businessId);
  };

  const columns: Column<Service>[] = [
    { header: "Name", accessor: "name" },
    { header: "Price", accessor: (row) => row.price || "—" },
    { header: "Duration(M)", accessor: (row) => row.duration_minutes || "—" },
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
            onClick={() => {
              softDeleteService(row.id);
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
        <h2 className="text-2xl font-bold">Services</h2>
        <Button onClick={openAdd}>+ Add Service</Button>
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
              {modal.editId ? "Edit" : "New"} Service
            </h3>
            <Form
              initialValues={modal.values}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {() => (
                <>
                  <TextInput name="name" label="Name" required />
                  <TextInput name="price" label="Price" required />
                  <TextInput
                    type="hidden"
                    name="business_id"
                    label="Business ID"
                    value={businessId}
                    required
                  />
                  <TextInput
                    type="number"
                    name="duration_minutes"
                    label="Duration(M)"
                    min={0}
                    step={1}
                    required
                  />
                  <SelectInput
                    name="branch_id"
                    label="Branch"
                    options={branchOptions}
                    required
                  />
                  <CheckboxInput name="is_active" label="Active" required />
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

export default ServicesPage;
