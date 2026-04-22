import React from "react";
import { useFormikContext } from "formik";

type ButtonVariant = "primary" | "secondary" | "inverted" | "danger" | "ghost";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  inForm?: boolean; // set to true when button is inside a Formik form
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  inForm = false,
  className = "",
  disabled,
  ...props
}) => {
  const formikContext = inForm ? useFormikContext() : null;
  const handleSubmit = formikContext?.handleSubmit;

  // Base styles (no padding/font-size here; handled by size classes)
  const baseStyles =
    "rounded-md font-bold transition-all duration-200 flex items-center justify-center space-x-sm disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:bg-primary-700",
    secondary: "bg-secondary text-white hover:bg-secondary-700",
    inverted:
      "bg-white text-primary border-2 border-primary hover:bg-primary-50",
    danger: "bg-red-500 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
  };

  const sizes: Record<ButtonSize, string> = {
    xs: "px-xs py-xs text-xs",
    sm: "px-sm py-sm text-sm",
    md: "px-md py-sm text-base", // default
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

  // Determine spinner size based on button size
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
      disabled={disabled || loading}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div
          className={`animate-spin inline-block ${spinnerSizeClass} border-2 border-white border-t-transparent rounded-full mr-1`}
        />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
