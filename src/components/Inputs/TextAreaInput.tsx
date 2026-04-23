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
        <label
          htmlFor={name}
          className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        name={name}
        id={name}
        value={(values as FormikValues)[name] || ""}
        className={`
          w-full px-3 py-2 rounded-md border resize-y
          border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2
          focus:ring-primary dark:focus:ring-primary-400
          focus:border-primary dark:focus:border-primary-400
        `}
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
