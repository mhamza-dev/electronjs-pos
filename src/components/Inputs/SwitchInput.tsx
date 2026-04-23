import React from "react";
import { useFormikContext, FormikValues } from "formik";
import FormError from "../Form/FormError";

interface SwitchInputProps {
  name: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const SwitchInput: React.FC<SwitchInputProps> = ({
  name,
  label,
  className = "",
  disabled = false,
}) => {
  const { values, setFieldValue, setFieldTouched, errors, touched } =
    useFormikContext<FormikValues>();

  const value = values[name] === true;

  const handleChange = () => {
    setFieldValue(name, !value);
    setFieldTouched(name, true);
  };

  return (
    <div className={`p-2 ${className}`}>
      <div className="flex items-center">
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={handleChange}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-primary dark:focus:ring-primary-400
            dark:focus:ring-offset-gray-900
            ${value ? "bg-primary dark:bg-primary-400" : "bg-gray-300 dark:bg-gray-600"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <span
            className={`
              inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out
              ${value ? "translate-x-5" : "translate-x-0.5"}
            `}
          />
        </button>
        {label && (
          <span
            className={`ml-3 text-sm font-medium ${
              disabled
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-700 dark:text-gray-300"
            }`}
            onClick={!disabled ? handleChange : undefined}
            style={{ cursor: !disabled ? "pointer" : "default" }}
          >
            {label}
          </span>
        )}
      </div>
      <FormError
        error={(errors as Record<string, string>)[name]}
        isVisible={(touched as Record<string, boolean>)[name]}
      />
    </div>
  );
};

export default SwitchInput;
