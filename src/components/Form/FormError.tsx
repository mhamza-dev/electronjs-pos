import React from "react";

// Props
interface FormErrorProps {
  error: string;
  isVisible: boolean;
}

const FormError: React.FC<FormErrorProps> = ({ error, isVisible }) => {
  if (!isVisible || !error) return null;
  return <p className="text-sm text-red-500">{error}</p>;
};

export default FormError;
