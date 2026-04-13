import React from 'react';

// 3rd Party Libraries
import { useNavigate } from 'react-router-dom';

// Components
import { Form } from '../../components/Form';
import { TextInput } from '../../components/Inputs';
import Button from '../../components/Button';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (values: any) => {
    if (values.username === 'admin' && values.password === 'admin') {
      navigate('/dashboard');
    } else {
      alert('Invalid credentials! Use admin/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md bg-gray-50">
      <div className="w-width-card-lg p-lg bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-center mb-xl">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0m-4 8a2 2 0 110-4 2 2 0 010 4zm-8 8a2 2 0 110-4 2 2 0 010 4zm-4-8a2 2 0 110-4 2 2 0 010 4zm0 0V7a4 4 0 018 0v4m-8 8a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-center mb-xs text-gray-900">Welcome Back</h2>
        <p className="text-center text-gray-400 mb-xl font-medium">Please login to your POS account</p>
        <Form initialValues={{ username: '', password: '' }} onSubmit={handleLogin} className="space-y-md">
          <TextInput type="text" name="username" label="Username" placeholder="Enter admin" />
          <TextInput type="password" name="password" label="Password" placeholder="Enter admin" />
          <Button variant="primary" type="submit" className="w-full">
            Login to POS
          </Button>
        </Form>
        <div className="mt-lg text-center">
          <p className="text-gray-500">Don't have an account? <button onClick={() => navigate('/signup')} className="text-primary font-bold hover:underline">Sign up</button></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
