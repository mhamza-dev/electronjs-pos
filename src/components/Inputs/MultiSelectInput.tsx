import React, { useState, useRef, useEffect } from "react";
import { useFormikContext, FormikValues } from "formik";
import FormError from "../Form/FormError";

export interface Option {
  label: string;
  value: string | number;
}

interface MultiSelectInputProps {
  name: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  name,
  label,
  options,
  placeholder = "Select...",
  className = "",
  disabled = false,
}) => {
  const { values, setFieldValue, setFieldTouched, errors, touched } =
    useFormikContext<FormikValues>();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues: (string | number)[] = values[name] || [];
  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value),
  );

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (value: string | number) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setFieldValue(name, newValues);
    setFieldTouched(name, true);
  };

  const handleRemove = (value: string | number) => {
    const newValues = selectedValues.filter((v) => v !== value);
    setFieldValue(name, newValues);
    setFieldTouched(name, true);
  };

  return (
    <div className={`p-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Input / Selected chips area */}
        <div
          className={`
            w-full min-h-[42px] px-3 py-1.5 border border-gray-300 dark:border-gray-600
            rounded-md transition-colors
            focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent
            dark:focus-within:ring-primary-400 dark:focus-within:border-transparent
            ${
              disabled
                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 cursor-pointer"
            }
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center bg-primary-50 text-primary dark:bg-primary-100/20 dark:text-primary-300 text-sm rounded-full px-3 py-0.5"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(opt.value);
                    }}
                    className="ml-1 text-primary hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-100 focus:outline-none"
                    disabled={disabled}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                {placeholder}
              </span>
            )}
            {selectedOptions.length === 0 && <span className="flex-1" />}
          </div>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-primary-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {/* Options list */}
            <ul className="overflow-y-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </li>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <li
                      key={opt.value}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleOption(opt.value);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary dark:text-primary-400 border-gray-300 dark:border-gray-500 rounded focus:ring-primary dark:focus:ring-primary-400 bg-white dark:bg-gray-700"
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        {opt.label}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      <FormError
        error={(errors as Record<string, string>)[name]}
        isVisible={(touched as Record<string, boolean>)[name]}
      />
    </div>
  );
};

export default MultiSelectInput;
