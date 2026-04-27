import React from "react";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import * as yup from "yup";
import { businessService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import { useAPI } from "../../hooks/useApi";

interface CreateBusinessModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const validationSchema = yup.object({
  business_name: yup.string().required("Business name is required"),
  legal_name: yup.string(),
  timezone: yup.string().default("UTC"),
  currency_code: yup.string().default("USD"),
});

const CreateBusinessModal: React.FC<CreateBusinessModalProps> = ({
  onClose,
  onCreated,
}) => {
  const { profile } = useAuth();
  const { request: createBusiness, loading } = useAPI(
    businessService.createBusiness,
  );

  const handleSubmit = async (values: any) => {
    await createBusiness({
      owner_user_id: profile!.id,
      business_name: values.business_name,
      legal_name: values.legal_name || values.business_name,
      timezone: values.timezone,
      currency_code: values.currency_code,
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-7xl min-w-5xl max-h-[80vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Create New Business
        </h3>
        <Form
          initialValues={{
            business_name: "",
            legal_name: "",
            timezone: "UTC",
            currency_code: "USD",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <TextInput name="business_name" label="Business Name" required />
          <TextInput name="legal_name" label="Legal Name (optional)" />
          <TextInput
            name="timezone"
            label="Timezone"
            placeholder="e.g., America/New_York"
          />
          <TextInput
            name="currency_code"
            label="Currency Code"
            placeholder="USD"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              inForm
              disableIfInvalid
              type="submit"
              variant="primary"
              loading={loading}
            >
              Create
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CreateBusinessModal;
