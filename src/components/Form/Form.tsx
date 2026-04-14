import React from "react";
// 3rd Party Libraries
import { Formik } from "formik";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    initialValues: any;
    onSubmit: (values: any) => void | Promise<any>;
    onChange?: (values: any) => void;
    children: React.ReactNode;
}

const Form: React.FC<FormProps> = ({
    initialValues,
    onSubmit,
    onChange,
    children,
    ...props
}) => {
    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit} onChange={onChange} {...props}>
            {() =>
                <>
                    {children}
                </>
            }
        </Formik>
    );
};

export default Form;
