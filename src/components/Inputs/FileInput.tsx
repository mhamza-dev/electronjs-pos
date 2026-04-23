import React, { useState } from "react";
import { useFormikContext, FormikValues } from "formik";
import FormError from "../Form/FormError";

interface FileInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> {
  name: string;
  label?: string;
  className?: string;
  accept?: string;
  multiple?: boolean;
  /** Store file as File object (default) or as base64 string */
  storeAs?: "file" | "base64";
  /** Show image preview for accepted image files */
  showPreview?: boolean;
  /** Max file size in MB */
  maxSizeMB?: number;
}

const FileInput: React.FC<FileInputProps> = ({
  name,
  label,
  className,
  accept = "image/*",
  multiple = false,
  storeAs = "file",
  showPreview = true,
  maxSizeMB,
  ...props
}) => {
  const {
    setFieldValue,
    setFieldTouched,
    setFieldError,
    errors,
    touched,
    values,
  } = useFormikContext<FormikValues>();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setFieldValue(name, multiple ? [] : null);
      setPreviewUrls([]);
      return;
    }

    // Check file size if maxSizeMB provided
    if (maxSizeMB) {
      const maxBytes = maxSizeMB * 1024 * 1024;
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxBytes) {
          setFieldError(name, `File "${files[i].name}" exceeds ${maxSizeMB}MB`);
          return;
        }
      }
    }

    setFieldTouched(name, true);

    if (storeAs === "file") {
      // Store File objects directly
      const fileArray = Array.from(files);
      setFieldValue(name, multiple ? fileArray : fileArray[0]);
    } else if (storeAs === "base64") {
      // Convert to base64 strings
      const base64Array = await Promise.all(
        Array.from(files).map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        }),
      );
      setFieldValue(name, multiple ? base64Array : base64Array[0]);
    }

    // Generate preview URLs for images
    if (showPreview) {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      const urls = imageFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleRemove = () => {
    setFieldValue(name, multiple ? [] : null);
    setPreviewUrls([]);
  };

  const currentValue = values[name];
  const hasFile = multiple
    ? (currentValue as any[])?.length > 0
    : !!currentValue;

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
      <div className="relative">
        <input
          type="file"
          id={name}
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          onBlur={() => setFieldTouched(name, true)}
          className={`
            block w-full text-sm rounded-md p-2 cursor-pointer
            text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
            file:text-sm file:font-semibold file:cursor-pointer
            file:bg-primary-50 file:text-primary
            dark:file:bg-gray-700 dark:file:text-primary-300
            hover:file:bg-primary-100
            dark:hover:file:bg-gray-600
            border border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-primary-200
            dark:focus:ring-primary-800
          `}
          {...props}
        />
        {hasFile && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Remove file"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {showPreview && previewUrls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {previewUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
            >
              <img
                src={url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {!showPreview && hasFile && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {multiple
            ? `${(currentValue as any[]).length} file(s) selected`
            : "File selected"}
        </p>
      )}

      <FormError
        error={(errors as Record<string, string>)[name]}
        isVisible={(touched as Record<string, boolean>)[name]}
      />
    </div>
  );
};

export default FileInput;
