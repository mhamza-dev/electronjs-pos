import React from "react";
import { useFormikContext, FormikValues } from "formik";
import FormError from "../Form/FormError";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  className?: string;
}

const TextAreaInput: React.FC<TextAreaProps> = ({
  name,
  label,
  className,
  rows = 3,
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
      <textarea
        name={name}
        id={name}
        value={(values as FormikValues)[name] || ""}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        onChange={handleChange(name)}
        onBlur={() => setFieldTouched(name, true)}
        rows={rows}
        {...props}
      />
      <FormError
        error={(errors as Record<string, string>)[name]}
        isVisible={(touched as Record<string, boolean>)[name]}
      />
    </div>
  );
};

export default TextAreaInput;
