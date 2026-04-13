import React from 'react';

// React Router
import { useNavigate } from 'react-router-dom';

// Components
import { Form } from '../../components/Form';
import { TextInput } from '../../components/Inputs';
import Button from '../../components/Button';


const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignup = (values: any) => {
    console.log('Signup values:', values);
    alert('Account created! Please login.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md bg-gray-50">
      <div className="w-width-card-lg p-lg bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-center mb-xl">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-center mb-xs text-gray-900">Create Account</h2>
        <p className="text-center text-gray-400 mb-xl font-medium">Join our POS system today</p>
        <Form initialValues={{ username: '', email: '', password: '', confirmPassword: '' }} onSubmit={handleSignup} className="space-y-md">
          <TextInput type="text" name="username" label="Username" placeholder="Enter username" />
          <TextInput type="email" name="email" label="Email Address" placeholder="Enter email" />
          <TextInput type="password" name="password" label="Password" placeholder="Create password" />
          <TextInput type="password" name="confirmPassword" label="Confirm Password" placeholder="Repeat password" />
          <Button variant="primary" type="submit" className="w-full">
            Sign Up Now
          </Button>
        </Form>
        <div className="mt-lg text-center">
          <p className="text-gray-500">Already have an account? <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Login</button></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
