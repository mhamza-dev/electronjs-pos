import React, { useEffect, useState } from "react";
import {
  listPackagesByBusiness,
  createPackage,
  updatePackage,
  softDeletePackage,
} from "../../services/servicePackageDealService";
import { Package, PackageInsert } from "../../data/types";
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

const PackagesPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { profile } = useAuth();
  const { data, error, loading, request } = useApi<Package[]>(
    listPackagesByBusiness,
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
  const openEdit = (p: Package) =>
    setModal({
      open: true,
      editId: p.id,
      values: {
        name: p.name,
        price: String(p.price) || "",
        duration_minutes: String(p.duration_minutes) || "",
        is_active: p.is_active ?? true,
        branch_id: p.branch_id || "",
        business_id: businessId,
      },
    });

  const handleSubmit = async (values: typeof initForm) => {
    const params = {
      ...values,
      price: Number(values.price),
      duration_minutes: Number(values.duration_minutes) || undefined,
    };
    if (modal.editId) {
      await updatePackage(modal.editId, params as PackageInsert);
    } else {
      await createPackage(params as PackageInsert);
    }
    setModal({ ...modal, open: false });
    request(businessId);
  };

  const columns: Column<Package>[] = [
    { header: "Name", accessor: "name" },
    { header: "Price", accessor: (row) => `$${row.price}` },
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
            onClick={async () => {
              await softDeletePackage(row.id);
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
        <h2 className="text-2xl font-bold">Packages</h2>
        <Button onClick={openAdd}>+ Add Package</Button>
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
              {modal.editId ? "Edit" : "New"} Package
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
                  <TextInput type="hidden" name="business_id" />
                  <TextInput
                    type="number"
                    name="duration_minutes"
                    label="Duration (mins)"
                    min={0}
                    step={1}
                  />
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

export default PackagesPage;
