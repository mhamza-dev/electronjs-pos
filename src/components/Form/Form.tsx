import React from "react";
import { Formik, FormikConfig, FormikProps } from "formik";

interface FormProps extends Omit<FormikConfig<any>, "onSubmit"> {
  onSubmit: (values: any, formikHelpers?: any) => void | Promise<any>;
  children: React.ReactNode | ((props: FormikProps<any>) => React.ReactNode);
  className?: string;
  id?: string;
  /** Prevent default Enter key submission (if you want to control it manually) */
  disableEnterSubmit?: boolean;
}

const Form: React.FC<FormProps> = ({
  children,
  className = "",
  id,
  disableEnterSubmit = false,
  ...formikProps
}) => {
  return (
    <Formik {...formikProps} enableReinitialize>
      {(formik) => (
        <form
          id={id}
          className={className}
          onSubmit={formik.handleSubmit}
          onKeyDown={(e) => {
            if (disableEnterSubmit && e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          {typeof children === "function" ? children(formik) : children}
        </form>
      )}
    </Formik>
  );
};

export default Form;
