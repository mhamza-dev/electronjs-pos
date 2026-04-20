import React from "react";
import * as yup from "yup";

import { Form } from "../../components/Form";
import {
  SelectInput,
  TextInput,
  TextAreaInput,
  CheckboxInput,
  FileInput,
} from "../../components/Inputs";
import { Button } from "../../components/Buttons";

import { CatalogProductInsert, UserProfile } from "../../data/type";

interface FormModalProps {
  isVisible: boolean;
  profile: UserProfile | null;
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
  image_url: yup.string().url("Must be a valid URL").nullable(),
});

const ProductForm: React.FC<FormModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  item,
}) => {
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
    image_url: item?.image_url || "",
    category_ids: item?.category_ids || [],
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4">
          {item?.product_name ? "Edit Product" : "Add New Product"}
        </h3>
        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          className="space-y-4"
        >
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
            options={[
              { label: "Each (ea)", value: "ea" },
              { label: "Kilogram (kg)", value: "kg" },
              { label: "Gram (g)", value: "g" },
              { label: "Liter (L)", value: "L" },
              { label: "Meter (m)", value: "m" },
              { label: "Box", value: "box" },
              { label: "Pack", value: "pack" },
              { label: "Hour", value: "hour" },
            ]}
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
            name="product_image"
            label="Product Image"
            accept="image/png, image/jpeg, image/webp"
            storeAs="base64" // or "file"
            showPreview
            maxSizeMB={5}
          />
          <div className="flex items-center">
            <CheckboxInput
              label="Active (available for sale)"
              name="is_active"
            />
          </div>
          {/* Category selection can be added here if needed */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button inForm={true} type="submit" variant="primary">
              {item?.product_name ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProductForm;
