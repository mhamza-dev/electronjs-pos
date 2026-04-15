import React from "react";
import { Item, UserProfile } from "../../data/type";
import { Form } from "../../components/Form";
import { SelectInput, TextInput } from "../../components/Inputs";
import CheckboxInput from "../../components/Inputs/CheckboxInput";
import { Button } from "../../components/Buttons";
import * as yup from "yup";

interface FormModalProps {
  isVisible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  item: Item;
}

const validateSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required"),
  sku: yup.string().required("SKU is required"),
  price: yup.number().required("Price is required"),
  cost: yup.number().required("Cost is required"),
});

const FormModal: React.FC<FormModalProps> = ({
  isVisible,
  profile,
  onClose,
  item,
}) => {
  if (!isVisible) return null;

  const initialValues = {
    ...item,
    business_id: profile?.current_business_id || "",
  };

  console.log("initialValues ->", initialValues);

  const handleSubmit = async (values: Item) => {
    console.log("Values ->", values, profile);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl width-card-lg p-6">
        <h3 className="text-xl font-bold mb-4">
          {item?.name ? "Edit Product" : "Add New Product"}
        </h3>
        <Form
          key={item.id}
          initialValues={initialValues}
          validationSchema={validateSchema}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <TextInput
            label="Name"
            name="name"
            type="text"
            className="mt-1 w-full rounded-lg px-3 py-2"
          />
          <SelectInput
            label="Type"
            name="type"
            className="mt-1 w-full rounded-lg px-3 py-2"
            options={[
              { label: "General", value: "general" },
              { label: "Food", value: "food" },
              { label: "Clothing", value: "clothing" },
              { label: "Service", value: "service" },
              { label: "Beverage", value: "beverage" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="SKU"
              name="sku"
              type="text"
              className="mt-1 w-full rounded-lg px-3 py-2"
            />
            <TextInput
              label="Barcode"
              name="barcode"
              type="text"
              className="mt-1 w-full rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Price ($)"
              name="price"
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-lg px-3 py-2"
            />
            <TextInput
              label="Cost ($)"
              name="cost"
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-center">
            <CheckboxInput
              label="Active"
              name="is_active"
              className="mt-1 w-full rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button inForm={true} type="submit" variant="primary">
              {item?.name ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default FormModal;
