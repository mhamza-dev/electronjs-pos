import React from "react";
import { Form } from "./Form";
import { Button } from "./Buttons";

interface CheckoutProps {
  total: number;
  onCheckout: (orderDetails: any) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ total, onCheckout }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckout({ total });
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Checkout</h2>
      <Form initialValues={{ total }} onSubmit={handleSubmit}>
        <Button
          inForm={true}
          type="submit"
          variant="primary"
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
        >
          Place Order
        </Button>
      </Form>
    </div>
  );
};

export default Checkout;
