import React, { useEffect } from "react";
import { useAPI } from "../../hooks/useAPI";
import { businessService } from "../../services";
import { Form } from "../../components/Form";
import { SelectInput, TextInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { timezoneOptions } from "../../data/constants";

const BusinessSettings: React.FC<{ businessId: string }> = ({ businessId }) => {
  const { data: business, request: fetchBusiness } = useAPI(() =>
    businessService.getBusiness(businessId),
  );
  const { request: updateBusiness, loading } = useAPI(
    businessService.updateBusiness,
  );

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  if (!business) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Business Details</h2>
      <Form
        initialValues={{
          business_name: business.business_name,
          legal_name: business.legal_name || "",
          timezone: business.timezone,
          currency_code: business.currency_code,
        }}
        onSubmit={async (values) => {
          await updateBusiness(businessId, values);
          alert("Business updated");
        }}
      >
        <TextInput name="business_name" label="Business Name" required />
        <TextInput name="legal_name" label="Legal Name" />
        <SelectInput
          name="timezone"
          label="Timezone"
          options={timezoneOptions}
        />
        <SelectInput
          name="currency_code"
          label="Currency"
          options={["USD", "EUR", "GBP", "PKR"].map((c) => ({
            label: c,
            value: c,
          }))}
        />
        <Button type="submit" loading={loading}>
          Save Business
        </Button>
      </Form>
    </div>
  );
};

export default BusinessSettings;
