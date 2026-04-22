import React from "react";
import { useFormikContext, FormikValues } from "formik";
import FormError from "../Form/FormError";

interface CheckboxInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  name: string;
  label?: string;
  className?: string;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  name,
  label,
  className,
  ...props
}) => {
  const { values, setFieldValue, setFieldTouched, errors, touched } =
    useFormikContext<FormikValues>();

  const checked = !!values[name];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, e.target.checked);
    setFieldTouched(name, true);
  };

  return (
    <div className={`p-2 ${className}`}>
      <label className="inline-flex items-center cursor-pointer">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={handleChange}
            onBlur={() => setFieldTouched(name, true)}
            className="sr-only peer"
            {...props}
          />
          <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-primary peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary-200 transition-all duration-200 mr-3 flex items-center justify-center">
            {checked && (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
        </div>
      </label>

      <FormError
        error={(errors as Record<string, string>)[name]}
        isVisible={(touched as Record<string, boolean>)[name]}
      />
    </div>
  );
};

export default CheckboxInput;
