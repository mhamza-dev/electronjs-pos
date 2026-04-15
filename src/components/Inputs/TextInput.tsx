import React from "react";

//3rd Party Libraries
import { useFormikContext, FormikValues } from "formik";

// Components
import FormError from "../Form/FormError";

//Props
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  className?: string;
}

const TextInput: React.FC<InputProps> = ({
  name,
  label,
  className,
  ...props
}) => {
  const { handleChange, setFieldTouched, errors, touched, values } =
    useFormikContext();
  return (
    <div className={`p-2 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-gray-700 font-medium mb-2">
          {label}
        </label>
      )}
      <input
        name={name}
        value={(values as FormikValues)[name]}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        onChange={handleChange(name)}
        onBlur={() => setFieldTouched(name, true)}
        {...props}
      />

      <FormError
        error={(errors as Record<string, string>)[name]}
        isVisible={(touched as Record<string, boolean>)[name]}
      />
    </div>
  );
};

export default TextInput;
