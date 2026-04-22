import React, { useEffect } from "react";
import { useAPI } from "../../hooks/useAPI";
import { businessService } from "../../services";
import { Form } from "../../components/Form";
import { SelectInput, TextInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { timezoneOptions, businessCategoryOptions } from "../../data/constants";

const BusinessSettings: React.FC<{ businessId: string }> = ({ businessId }) => {
  const {
    data: business,
    loading: fetching,
    request: fetchBusiness,
  } = useAPI(() => businessService.getBusiness(businessId));
  const { request: updateBusiness, loading: updating } = useAPI(
    businessService.updateBusiness,
  );

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  // Loading skeleton
  if (fetching || !business) {
    return (
      <div className="space-y-lg">
        <div className="space-y-xs">
          <div className="h-7 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-lg space-y-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-sm">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg max-w-width-container-md">
      {/* Header */}
      <div className="space-y-xs">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Business Settings
        </h2>
        <p className="text-sm text-gray-500">
          Update your business information and regional preferences
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-lg">
        <Form
          initialValues={{
            business_name: business.business_name,
            legal_name: business.legal_name || "",
            timezone: business.timezone,
            currency_code: business.currency_code,
            business_category: business.business_category || "Other",
          }}
          onSubmit={async (values) => {
            await updateBusiness(businessId, values);
            alert("Business settings updated successfully");
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <TextInput
              name="business_name"
              label="Business Name"
              required
              placeholder="Your business name"
            />

            <TextInput
              name="legal_name"
              label="Legal Name"
              placeholder="Legal entity name (optional)"
            />

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

            <SelectInput
              name="business_category"
              label="Business Type"
              options={businessCategoryOptions}
              className="md:col-span-2"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end mt-lg pt-sm border-t border-gray-100">
            <Button
              type="submit"
              variant="primary"
              loading={updating}
              className="shadow-sm"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-400 text-right">
        Last updated: {new Date(business.updated_at).toLocaleString()}
      </div>
    </div>
  );
};

export default BusinessSettings;
