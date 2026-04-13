import React from 'react'
// 3rd Party Libraries
import { Formik } from 'formik'


interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    initialValues: any;
    onSubmit: (values: any) => void | Promise<any>;
    children: React.ReactNode;
}

const Form: React.FC<FormProps> = ({ initialValues, onSubmit, children, ...props }) => {
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            {...props}
        >
            {() =>
                <>
                    {children}
                </>
            }
        </Formik>
    )
}

export default Form