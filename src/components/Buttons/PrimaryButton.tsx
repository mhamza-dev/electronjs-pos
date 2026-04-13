import React from 'react'

const PrimaryButton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <button className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors">
      {children}
    </button>
  )
}

export default PrimaryButton