import React from "react";

//3rd Party Libraries
import { useFormikContext } from "formik";

// Components
import FormError from "../Form/FormError";

//Props
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

const TextInput: React.FC<InputProps> = ({ name, label, ...props }) => {
  const { handleChange, setFieldTouched, errors, touched } = useFormikContext();
  return (
    <div className="form-control">
      {label && (
        <label htmlFor={name} className="block text-gray-700 font-medium mb-2">
          {label}
        </label>
      )}
      <input
        name={name}
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
