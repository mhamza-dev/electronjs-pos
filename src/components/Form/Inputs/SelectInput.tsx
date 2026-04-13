import React from 'react'

//3rd Party Libraries
import { useFormikContext } from 'formik'

// Components
import FormError from '../FormError'

//Props
interface InputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    name: string,
    options: { value: string, label: string }[],
    label?: string,
}

const SelectInput: React.FC<InputProps> = ({ name, options, label, ...props }) => {
    const { handleChange, setFieldTouched, errors, touched } = useFormikContext()
    return (
        <div className='form-control'>
            {label && <label htmlFor={name} className="block text-gray-700 font-medium mb-2">{label}</label>}
            <select
                name={name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                {...props}
                onChange={handleChange(name)}
                onBlur={() => setFieldTouched(name, true)}
            >
                <option value="">Select</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>{option.label}</option>
                ))}
            </select>
            <FormError error={(errors as Record<string, string>)[name]} isVisible={(touched as Record<string, boolean>)[name]} />
        </div>

    )
}

export default SelectInput