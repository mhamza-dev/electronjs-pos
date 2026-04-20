import React from "react";
import { FormikProps } from "formik";
import { Button } from "./Buttons";
import { Form } from "./Form";
import { TextInput } from "./Inputs";
import * as yup from "yup";

interface CheckoutFormValues {
  discount: number;
  subtotal: number;
}

interface CheckoutProps {
  subtotal: number;
  tax: number;
  onCheckout: (orderDetails: {
    discount: number;
    totalAfterDiscount: number;
  }) => void;
}

const validationSchema = yup.object().shape({
  discount: yup
    .number()
    .min(0, "Discount cannot be negative")
    .max(yup.ref("$subtotal"), "Discount cannot exceed subtotal")
    .typeError("Please enter a valid number"),
});

const Checkout: React.FC<CheckoutProps> = ({ subtotal, tax, onCheckout }) => {
  const totalBeforeDiscount = subtotal + tax;

  const initialValues: CheckoutFormValues = {
    discount: 0,
    subtotal: subtotal,
  };

  const handleSubmit = (values: CheckoutFormValues) => {
    const discount = values.discount || 0;
    const totalAfterDiscount = Math.max(0, totalBeforeDiscount - discount);
    onCheckout({ discount, totalAfterDiscount });
  };

  const getDiscount = (formik: FormikProps<CheckoutFormValues>) => {
    const discount = formik.values.discount || 0;
    const totalAfterDiscount = Math.max(0, totalBeforeDiscount - discount);

    return { discount, totalAfterDiscount };
  };

  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <Form
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik: FormikProps<CheckoutFormValues>) => {
          const { discount, totalAfterDiscount } = getDiscount(formik);
          return (
            <div className="space-y-4">
              {/* Discount Field */}
              <TextInput
                name="discount"
                type="number"
                min="0"
                max={subtotal}
                step="0.01"
                placeholder="0.00"
                label="Discount ($)"
              />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {(discount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${(discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${totalAfterDiscount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                inForm={true}
                type="submit"
                variant="primary"
                className="w-full"
              >
                Place Order
              </Button>
            </div>
          );
        }}
      </Form>
    </div>
  );
};

export default Checkout;
