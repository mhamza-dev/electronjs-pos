// components/CashPaymentModal.tsx
import React from "react";
import { Button } from "../Buttons";
import { TextInput } from "../Inputs";
import { Form } from "../Form";
import * as yup from "yup";

interface CashPaymentModalProps {
  total: number;
  onSubmit: (amountTendered: number) => void;
  onCancel: () => void;
}

const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  total,
  onSubmit,
  onCancel,
}) => {
  const validationSchema = yup.object({
    amount_tendered: yup
      .number()
      .min(total, "Must be at least total.")
      .required("Amount is required"),
  });
  const handleSubmit = (values: { amount_tendered: number }) => {
    if (values.amount_tendered < total) {
      alert("Amount tendered is less than total.");
      return;
    }
    onSubmit(values.amount_tendered);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-7xl min-w-5xl max-h-[80vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Cash Payment
        </h3>
        <Form
          initialValues={{ amount_tendered: total }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values }) => {
            const tendered = values.amount_tendered || 0;
            const changeAmount = tendered >= total ? tendered - total : null;
            return (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ${total.toFixed(2)}
                  </p>
                </div>
                <TextInput
                  name="amount_tendered"
                  label="Amount Received"
                  type="number"
                  step="0.01"
                  min={total}
                  autoFocus
                />
                {changeAmount !== null && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Change Due
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      ${changeAmount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                  <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    inForm
                    disableIfInvalid
                    type="submit"
                    variant="primary"
                  >
                    Complete Sale
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

export default CashPaymentModal;
