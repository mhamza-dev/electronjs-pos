import React from "react";
import { Form } from "../Form";
import { TextInput } from "../Inputs";
import { Button } from "../Buttons";
import * as yup from "yup";
import { ProcurementSupplier } from "../../data/types";

interface SupplierModalProps {
  supplier: ProcurementSupplier | null;
  onSave: (supplier: Partial<ProcurementSupplier>) => void;
  onClose: () => void;
}

const validationSchema = yup.object({
  supplier_name: yup.string().required("Supplier name is required"),
  contact_name: yup.string().nullable(),
  email: yup.string().email("Invalid email").nullable(),
  phone: yup.string().nullable(),
  tax_id: yup.string().nullable(),
  status: yup.string().default("active"),
});

const SupplierModal: React.FC<SupplierModalProps> = ({
  supplier,
  onSave,
  onClose,
}) => {
  const initialValues = {
    supplier_name: supplier?.supplier_name || "",
    contact_name: supplier?.contact_name || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    tax_id: supplier?.tax_id || "",
    status: supplier?.status || "active",
  };

  const handleSubmit = (values: typeof initialValues) => {
    onSave({ ...supplier, ...values });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-7xl min-w-5xl max-h-[80vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {supplier ? "Edit Supplier" : "New Supplier"}
        </h3>
        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <TextInput
            name="supplier_name"
            label="Supplier Name"
            required
            placeholder="e.g., ABC Supplies"
          />
          <TextInput
            name="contact_name"
            label="Contact Name"
            placeholder="John Doe"
          />
          <TextInput
            name="email"
            label="Email"
            type="email"
            placeholder="contact@example.com"
          />
          <TextInput name="phone" label="Phone" placeholder="+1 234 567 890" />
          <TextInput
            name="tax_id"
            label="Tax ID / VAT"
            placeholder="123-456-789"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {supplier ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SupplierModal;
