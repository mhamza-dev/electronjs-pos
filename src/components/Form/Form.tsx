import React from "react";
// 3rd Party Libraries
import { Formik } from "formik";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  initialValues: any;
  onSubmit: (values: any) => void | Promise<any>;
  children: React.ReactNode;
}

const Form: React.FC<FormProps> = ({
  initialValues,
  onSubmit,
  children,
  className = "",
  ...props
}) => {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} {...props}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} className={className}>
          {children}
        </form>
      )}
    </Formik>
  );
};

export default Form;
