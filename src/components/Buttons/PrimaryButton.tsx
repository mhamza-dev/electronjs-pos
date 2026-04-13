import React from 'react'
// 3rd Party Libraries
import { useFormikContext } from 'formik'

// Props
interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode,
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = '', ...props }) => {
  const { handleSubmit } = useFormikContext()
  if (props.type === 'submit') {
    props.onClick = () => {
      handleSubmit()
    }
  }
  return (
    <button
      className={`bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default PrimaryButton