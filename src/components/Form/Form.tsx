import React from "react";
// 3rd Party Libraries
import { Formik, FormikConfig } from "formik";

interface FormProps extends Omit<FormikConfig<any>, "onSubmit"> {
  onSubmit: (values: any) => void | Promise<any>;
  children: React.ReactNode;
  className?: string;
}

const Form: React.FC<FormProps> = ({
  children,
  className = "",
  ...formikProps
}) => {
  return (
    <Formik {...formikProps} enableReinitialize>
      {() => <>{children}</>}
    </Formik>
  );
};

export default Form;
