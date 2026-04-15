import React from "react";
import { useFormikContext } from "formik";

type ButtonVariant = "primary" | "secondary" | "inverted" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  inForm?: boolean; // set to true when button is inside a Formik form
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  loading = false,
  inForm = false,
  className = "",
  ...props
}) => {
  // Only access Formik context if the button is meant to be used inside a Formik form
  const formikContext = inForm ? useFormikContext() : null;
  const handleSubmit = formikContext?.handleSubmit;

  const baseStyles =
    "px-3 py-2 rounded-md font-bold transition-all duration-200 flex items-center justify-center space-x-sm disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-700",
    secondary: "bg-secondary text-white hover:bg-secondary-700",
    inverted:
      "bg-white text-primary border-2 border-primary hover:bg-primary-50",
    danger: "bg-red-500 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Only prevent default and call Formik's handleSubmit if inForm and type="submit"
    if (props.type === "submit" && inForm && handleSubmit) {
      e.preventDefault();
      handleSubmit();
    }
    // Always call the original onClick if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="animate-spin inline-block h-4 w-4 mr-2"></div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
