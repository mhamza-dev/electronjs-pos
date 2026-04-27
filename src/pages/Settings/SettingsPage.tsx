import React, { useEffect, useState } from "react";
import {
  getBusinessById,
  updateBusiness,
} from "../../services/businessService";
import {
  listBranchesByBusiness,
  createBranch,
  updateBranch,
  softDeleteBranch,
} from "../../services/branchService";
import {
  Business,
  BusinessUpdate,
  Branch,
  BranchInsert,
  BusinessType,
} from "../../data/types";
import Table, { Column } from "../../components/Table";
import { Button } from "../../components/Buttons";
import { Form } from "../../components/Form";
import { CheckboxInput, SelectInput, TextInput } from "../../components/Inputs";
import { useActiveBusinessId } from "../../contexts/ActiveBusinessContext";
import { useApi } from "../../hooks";

// ── Business type options ──────────────────────────────────────
const businessTypeOptions = [
  { label: "Retail", value: "retail" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Salon", value: "salon" },
  { label: "Hospital", value: "hospital" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Warehouse", value: "warehouse" },
  { label: "Hybrid", value: "hybrid" },
];

// ── Branch form initial values ─────────────────────────────────
const branchInitForm = {
  name: "",
  address: "",
  phone: "",
  is_active: true,
  business_id: "",
};

const SettingsPage: React.FC = () => {
  const businessId = useActiveBusinessId();

  // Business data
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessLoading, setBusinessLoading] = useState(false);

  // Branches list
  const {
    data: branches,
    error: branchesError,
    loading: branchesLoading,
    request: fetchBranches,
  } = useApi<Branch[]>(listBranchesByBusiness);

  // Business edit modal
  const [businessModal, setBusinessModal] = useState<{
    open: boolean;
    values: {
      name: string;
      type: BusinessType; // now typed as BusinessType, not string
      email: string;
      phone: string;
      address: string;
      timezone: string;
      currency: string;
    };
  }>({
    open: false,
    values: {
      name: "",
      type: "retail",
      email: "",
      phone: "",
      address: "",
      timezone: "Asia/Karachi",
      currency: "PKR",
    },
  });

  // Branch modal (add/edit)
  const [branchModal, setBranchModal] = useState<{
    open: boolean;
    editId?: string;
    values: typeof branchInitForm;
  }>({ open: false, values: branchInitForm });

  // Load business and branches on mount
  useEffect(() => {
    if (!businessId) return;

    const loadBusiness = async () => {
      setBusinessLoading(true);
      const { data } = await getBusinessById(businessId);
      setBusiness(data);
      setBusinessLoading(false);
    };

    loadBusiness();
    fetchBranches(businessId);
  }, [businessId, fetchBranches]);

  // ── Business edit handlers ──────────────────────────────────
  const openEditBusiness = () => {
    if (!business) return;
    setBusinessModal({
      open: true,
      values: {
        name: business.name,
        type: business.type,
        email: business.email || "",
        phone: business.phone || "",
        address: business.address || "",
        timezone: business.timezone || "Asia/Karachi",
        currency: business.currency || "PKR",
      },
    });
  };

  const handleBusinessSubmit = async (values: typeof businessModal.values) => {
    if (!businessId) return;
    const updateData: Partial<BusinessUpdate> = {
      id: businessId,
      name: values.name,
      type: values.type as BusinessType, // cast from string to BusinessType
      email: values.email,
      phone: values.phone,
      address: values.address,
      timezone: values.timezone,
      currency: values.currency,
    };
    await updateBusiness(businessId, updateData);
    setBusinessModal({ ...businessModal, open: false });
    // Refresh business data
    const { data } = await getBusinessById(businessId);
    setBusiness(data);
  };

  // ── Branch CRUD handlers ────────────────────────────────────
  const openAddBranch = () => {
    setBranchModal({
      open: true,
      values: { ...branchInitForm, business_id: businessId },
    });
  };

  const openEditBranch = (branch: Branch) => {
    setBranchModal({
      open: true,
      editId: branch.id,
      values: {
        name: branch.name,
        address: branch.address || "",
        phone: branch.phone || "",
        is_active: branch.is_active,
        business_id: businessId,
      },
    });
  };

  const handleBranchSubmit = async (values: typeof branchInitForm) => {
    if (branchModal.editId) {
      await updateBranch(branchModal.editId, values as BranchInsert);
    } else {
      await createBranch(values as BranchInsert);
    }
    setBranchModal({ ...branchModal, open: false });
    fetchBranches(businessId);
  };

  const handleDeleteBranch = async (id: string) => {
    await softDeleteBranch(id);
    fetchBranches(businessId);
  };

  // ── Branch table columns ────────────────────────────────────
  const branchColumns: Column<Branch>[] = [
    { header: "Name", accessor: "name" },
    { header: "Address", accessor: (row) => row.address || "—" },
    { header: "Phone", accessor: (row) => row.phone || "—" },
    { header: "Active", accessor: (row) => (row.is_active ? "Yes" : "No") },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="xs" onClick={() => openEditBranch(row)}>
            Edit
          </Button>
          <Button
            variant="dangerText"
            size="xs"
            onClick={() => handleDeleteBranch(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Business Section ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Business Settings</h2>
          <Button onClick={openEditBusiness} disabled={!business}>
            Edit Business
          </Button>
        </div>

        {businessLoading ? (
          <p className="text-gray-500">Loading business…</p>
        ) : business ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {business.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                {business.type}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {business.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {business.phone || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Address
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {business.address || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Timezone
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {business.timezone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Currency
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {business.currency}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No business data</p>
        )}
      </div>

      {/* ── Branches Section ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Branches</h2>
          <Button onClick={openAddBranch}>+ Add Branch</Button>
        </div>
        <Table
          columns={branchColumns}
          data={branches || []}
          error={branchesError}
          loading={branchesLoading}
        />
      </div>

      {/* ── Business Edit Modal ─────────────────────────────── */}
      {businessModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Business</h3>
            <Form
              initialValues={businessModal.values}
              onSubmit={handleBusinessSubmit}
              className="space-y-4"
            >
              {() => (
                <>
                  <TextInput name="name" label="Business Name" required />
                  <SelectInput
                    name="type"
                    label="Type"
                    options={businessTypeOptions}
                    required
                  />
                  <TextInput name="email" label="Email" type="email" />
                  <TextInput name="phone" label="Phone" />
                  <TextInput name="address" label="Address" />
                  <TextInput name="timezone" label="Timezone" />
                  <TextInput name="currency" label="Currency" />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setBusinessModal({ ...businessModal, open: false })
                      }
                    >
                      Cancel
                    </Button>
                    <Button type="submit" inForm>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </div>
        </div>
      )}

      {/* ── Branch Add/Edit Modal ───────────────────────────── */}
      {branchModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {branchModal.editId ? "Edit" : "New"} Branch
            </h3>
            <Form
              initialValues={branchModal.values}
              onSubmit={handleBranchSubmit}
              className="space-y-4"
            >
              {() => (
                <>
                  <TextInput name="name" label="Branch Name" required />
                  <TextInput name="address" label="Address" />
                  <TextInput name="phone" label="Phone" />
                  <CheckboxInput name="is_active" label="Active" />
                  <TextInput type="hidden" name="business_id" />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setBranchModal({ ...branchModal, open: false })
                      }
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

export default SettingsPage;
