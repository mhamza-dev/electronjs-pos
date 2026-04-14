import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Form/Inputs";
import { Button } from "../../components/Buttons";
import { supabase } from "../../lib/supabase";

interface LoginProps {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const INITIAL_VALUES: LoginProps = { email: "", password: "" };

  const handleLogin = async (values: LoginProps) => {

    try {
      setLoading(true);
      await supabase.auth.signInWithPassword(values);
      navigate("/dashboard");
    } catch (error: any) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-md bg-gray-50 font-poppins">
      <div className="w-width-card-lg p-lg bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-center mb-xl">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 118 0m-4 8a2 2 0 110-4 2 2 0 010 4zm-8 8a2 2 0 110-4 2 2 0 010 4zm-4-8a2 2 0 110-4 2 2 0 010 4zm0 0V7a4 4 0 018 0v4m-8 8a2 2 0 110-4 2 2 0 010 4z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-center mb-xs text-gray-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-center text-gray-400 mb-xl font-medium">
          Please login to your POS account
        </p>

        {error && (
          <div className="mb-lg p-sm bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        <Form
          initialValues={INITIAL_VALUES}
          onSubmit={handleLogin}
          className="space-y-md"
        >
          <TextInput
            type="email"
            name="email"
            label="Email Address"
            placeholder="admin@example.com"
            required
          />
          <TextInput
            type="password"
            name="password"
            label="Password"
            placeholder="••••••••"
            required
          />
          <div className="pt-sm">
            <Button type="submit" className="w-full" loading={loading}>
              Login
            </Button>
          </div>
        </Form>
        <div className="mt-lg text-center">
          <p className="text-gray-500 font-medium">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
