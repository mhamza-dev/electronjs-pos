import React from "react";

//3rd Party Libraries
import { useFormikContext, FormikValues } from "formik";

// Components
import FormError from "../Form/FormError";

//Props
interface CheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
  const { handleChange, setFieldTouched, errors, touched, values } =
    useFormikContext();
  return (
    <div className={`p-2 ${className}`}>
      <label className="flex items-center text-gray-700 font-medium">
        <input
          type="checkbox"
          name={name}
          className="mr-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
          onChange={handleChange(name)}
          value={(values as FormikValues)[name]}
          onBlur={() => setFieldTouched(name, true)}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>

      <FormError
        error={(errors as Record<string, string>)[name]}
        isVisible={(touched as Record<string, boolean>)[name]}
      />
    </div>
  );
};

export default CheckboxInput;
