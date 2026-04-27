import React, { useEffect, useState } from "react";
import {
  listSuppliersByBusiness,
  createSupplier,
  updateSupplier,
  softDeleteSupplier,
} from "../../services/supplierService";
import { Supplier, SupplierInsert } from "../../data/types";
import Table, { Column } from "../../components/Table";
import { Button } from "../../components/Buttons";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import { useApi } from "../../hooks";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";

const initForm = {
  name: "",
  phone: "",
  email: "",
};

const SuppliersPage: React.FC = () => {
  const businessId = useActiveBusinessId();
  const { data, error, loading, request } = useApi<Supplier[]>(
    listSuppliersByBusiness,
  );
  const [modal, setModal] = useState<{
    open: boolean;
    editId?: string;
    values: typeof initForm;
  }>({ open: false, values: initForm });

  useEffect(() => {
    if (businessId) request(businessId);
  }, [businessId, request]);

  const openAdd = () => setModal({ open: true, values: initForm });
  const openEdit = (s: Supplier) =>
    setModal({
      open: true,
      editId: s.id,
      values: {
        name: s.name,
        phone: s.phone || "",
        email: s.email || "",
      },
    });

  const handleSubmit = async (values: typeof initForm) => {
    const params: SupplierInsert = {
      ...values,
      business_id: businessId,
    };
    if (modal.editId) {
      await updateSupplier(modal.editId, params);
    } else {
      await createSupplier(params);
    }
    setModal({ ...modal, open: false });
    request(businessId);
  };

  const columns: Column<Supplier>[] = [
    { header: "Name", accessor: "name" },
    { header: "Phone", accessor: (row) => row.phone || "—" },
    { header: "Email", accessor: (row) => row.email || "—" },
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
              await softDeleteSupplier(row.id);
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
        <h2 className="text-2xl font-bold">Suppliers</h2>
        <Button onClick={openAdd}>+ Add Supplier</Button>
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
              {modal.editId ? "Edit" : "New"} Supplier
            </h3>
            <Form
              initialValues={modal.values}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {() => (
                <>
                  <TextInput name="name" label="Name" required />
                  <TextInput name="phone" label="Phone" />
                  <TextInput name="email" label="Email" type="email" />
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

export default SuppliersPage;
