import React, { useMemo } from "react";
import * as yup from "yup";

import { Form } from "../Form";
import {
  SelectInput,
  TextInput,
  TextAreaInput,
  CheckboxInput,
  FileInput,
} from "../Inputs";
import { Button } from "../Buttons";
import { useAuth } from "../../contexts/AuthContext";
import { uomOptions, nonInventoryUOMs } from "../../data/constants";
import { CatalogProductInsert } from "../../data/type";

interface FormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (values: CatalogProductInsert) => void;
  item: CatalogProductInsert | null; // null for new, object for edit
}

const validationSchema = yup.object().shape({
  product_name: yup.string().required("Product name is required"),
  sku: yup.string().nullable(),
  barcode: yup.string().nullable(),
  description: yup.string().nullable(),
  uom: yup.string().default("ea"),
  default_price: yup.number().min(0, "Price must be positive").nullable(),
  cost_price: yup.number().min(0, "Cost must be positive").nullable(),
  is_active: yup.boolean().default(true),
  track_inventory: yup.boolean().default(true),
  image_url: yup.string().url("Must be a valid URL").nullable(),
});

const ProductForm: React.FC<FormModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  item,
}) => {
  const { profile } = useAuth();

  // Get current business category
  const currentBusiness = profile?.business_users.find(
    (bu) => bu.business_id === profile.current_business_id,
  )?.business;
  const businessCategory = currentBusiness?.business_category || "Other";

  // Filter UOM options based on business category
  const filteredUOMOptions = useMemo(() => {
    return uomOptions
      .filter(
        (opt) =>
          opt.categories.includes("all") ||
          opt.categories.includes(businessCategory),
      )
      .map((opt) => ({ label: opt.label, value: opt.value }));
  }, [businessCategory]);

  if (!isVisible) return null;

  const initialValues: CatalogProductInsert = {
    product_name: item?.product_name || "",
    sku: item?.sku || "",
    barcode: item?.barcode || "",
    description: item?.description || "",
    uom: item?.uom || "ea",
    default_price: item?.default_price ?? 0,
    cost_price: item?.cost_price ?? 0,
    is_active: item?.is_active ?? true,
    track_inventory:
      item?.track_inventory ?? !nonInventoryUOMs.has(item?.uom || "ea"),
    image_url: item?.image_url || "",
    category_ids: item?.category_ids || [],
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-7xl min-w-5xl max-h-[80vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {item?.product_name ? "Edit Product" : "Add New Product"}
        </h3>
        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          className="space-y-4"
        >
          {({ values, setFieldValue }) => {
            // Auto-update track_inventory when UOM changes
            const handleUOMChange = () => {
              const newUOM = values.uom;
              setFieldValue("uom", newUOM);
              // Only auto-set track_inventory for new products (not editing)
              if (!item?.product_name) {
                setFieldValue("track_inventory", !nonInventoryUOMs.has(newUOM));
              }
            };

            return (
              <>
                <TextInput
                  label="Product Name"
                  name="product_name"
                  type="text"
                  placeholder="e.g. Organic Coffee"
                  required
                />
                <SelectInput
                  label="Unit of Measure (UOM)"
                  name="uom"
                  options={filteredUOMOptions}
                  onChange={handleUOMChange}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="SKU"
                    name="sku"
                    type="text"
                    placeholder="PROD-001"
                  />
                  <TextInput
                    label="Barcode"
                    name="barcode"
                    type="text"
                    placeholder="1234567890"
                  />
                </div>
                <TextAreaInput
                  label="Description"
                  name="description"
                  placeholder="Optional product description"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Default Price ($)"
                    name="default_price"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                  <TextInput
                    label="Cost Price ($)"
                    name="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
                <FileInput
                  name="image_url"
                  label="Product Image"
                  accept="image/png, image/jpeg, image/webp"
                  storeAs="file"
                  showPreview
                  maxSizeMB={5}
                />
                <div className="flex items-center gap-6">
                  <CheckboxInput
                    label="Active (available for sale)"
                    name="is_active"
                  />
                  <CheckboxInput
                    label="Track inventory quantity"
                    name="track_inventory"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button inForm={true} type="submit" variant="primary">
                    {item?.product_name ? "Update" : "Create"}
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
      </div>
    </div>
  );
};

export default ProductForm;
