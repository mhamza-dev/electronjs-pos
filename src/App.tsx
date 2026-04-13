import React from 'react'
import './App.css'
import { PrimaryButton } from './components/Buttons'
import { Form } from './components/Form'
import { TextInput } from './components/Form/Inputs'

const App: React.FC = () => {
  return (
    <>
      <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <Form initialValues={{ username: '', password: '' }} onSubmit={values => console.log(values)} className="space-y-4">
          <TextInput type="text" name="username" label="Username" />
          <TextInput type="password" name="password" label="Password" />
          <PrimaryButton>Login</PrimaryButton>
        </Form>
      </div>
    </>
  )
}

export default App
