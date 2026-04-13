import React from "react";
import { useFormikContext } from "formik";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  name,
  label,
  className = "",
  ...props
}) => {
  const { handleChange, setFieldTouched, errors, touched } = useFormikContext();

  const error = (errors as Record<string, string>)[name];
  const isTouched = (touched as Record<string, boolean>)[name];

  return (
    <div className={`form-control ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-gray-700 font-bold mb-2 text-sm"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        name={name}
        id={name}
        className={`w-full px-lg py-sm border ${isTouched && error ? "border-red-500" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400`}
        onChange={handleChange(name)}
        onBlur={() => setFieldTouched(name, true)}
      />
      {isTouched && error && (
        <div className="text-red-500 text-xs font-bold mt-1 ml-2">{error}</div>
      )}
    </div>
  );
};

export default TextInput;
