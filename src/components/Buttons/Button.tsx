import React from "react";
import { useFormikContext } from "formik";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "inverted"
  | "danger"
  | "ghost"
  | "dangerText";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  inForm?: boolean;
  /** Disable button when form is invalid (has validation errors) */
  disableIfInvalid?: boolean;
  /** If true, also require at least one field to be touched before disabling (prevents initial disable) */
  requireTouched?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  inForm = false,
  disableIfInvalid = false,
  requireTouched = true,
  className = "",
  disabled,
  ...props
}) => {
  const formikContext = inForm ? useFormikContext() : null;

  // Determine if button should be disabled due to validation errors
  let formDisabled = false;
  if (disableIfInvalid && formikContext) {
    const hasErrors = !formikContext.isValid;
    if (hasErrors) {
      formDisabled = requireTouched
        ? Object.keys(formikContext.touched).length > 0
        : true;
    }
  }

  const isDisabled = disabled || loading || formDisabled;
  const handleSubmit = formikContext?.handleSubmit;

  const baseStyles =
    "rounded-md font-bold transition-all duration-200 flex items-center justify-center space-x-sm disabled:opacity-50 disabled:cursor-not-allowed";

  // ----------------------------------------------------------------
  // Variants with explicit dark‑mode overrides.
  // The primary & secondary scales from your config are inverted in dark
  // mode (light ↔ dark), which would break button contrast. Therefore we
  // use fixed dark colours (original hex values) so the button always
  // retains a dark background in dark mode.
  // ----------------------------------------------------------------
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-primary text-white hover:bg-primary-700 " +
      "dark:bg-[#6b21a8] dark:hover:bg-[#7e22ce] dark:text-white",
    secondary:
      "bg-secondary text-white hover:bg-secondary-700 " +
      "dark:bg-[#3730a3] dark:hover:bg-[#4338ca] dark:text-white",
    inverted:
      "bg-white text-primary border-2 border-primary hover:bg-primary-50 " +
      "dark:bg-gray-800 dark:text-primary-300 dark:border-primary-300 dark:hover:bg-gray-700",
    danger:
      "bg-red-500 text-white hover:bg-red-700 " +
      "dark:bg-red-600 dark:hover:bg-red-700 dark:text-white",
    ghost:
      "bg-transparent text-gray-500 hover:bg-gray-100 " +
      "dark:text-gray-300 dark:hover:bg-gray-800",
    dangerText:
      "w-full flex items-center px-md py-sm text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors" +
      "dark:text-red-400 dark:hover:bg-red-400/10",
  };

  const sizes: Record<ButtonSize, string> = {
    xs: "px-xs py-xs text-xs",
    sm: "px-sm py-sm text-sm",
    md: "px-md py-sm text-base",
    lg: "px-lg py-md text-lg",
    xl: "px-xl py-md text-xl",
    "2xl": "px-2xl py-lg text-2xl",
    "3xl": "px-3xl py-xl text-3xl",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.type === "submit" && inForm && handleSubmit) {
      e.preventDefault();
      handleSubmit();
    }
    if (props.onClick) {
      props.onClick(e);
    }
  };

  const spinnerSizeClass = {
    xs: "w-3 h-3",
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
    "2xl": "w-6 h-6",
    "3xl": "w-6 h-6",
  }[size];

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isDisabled}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div
          // border-current picks up the button’s text colour – now works
          // perfectly for every variant, including inverted & ghost.
          className={`animate-spin inline-block ${spinnerSizeClass} border-2 border-current border-t-transparent rounded-full`}
        />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
