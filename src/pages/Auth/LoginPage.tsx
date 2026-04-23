import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.svg";

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
    <div className="min-h-screen flex items-center justify-center p-md bg-gray-50 dark:bg-gray-950 font-poppins">
      <div className="w-width-card-lg p-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-md">
          <img src={logo} alt="Vendora" className="w-24 h-24" />
        </div>
        <h2 className="text-xl font-bold text-center mb-xs text-gray-900 dark:text-gray-100 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-center text-gray-400 dark:text-gray-500 mb-md font-medium">
          Please login to your Vendora account
        </p>

        {error && (
          <div className="mb-lg p-sm bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-800">
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
            <Button
              inForm={true}
              type="submit"
              className="w-full"
              loading={loading}
            >
              Login
            </Button>
          </div>
        </Form>
        <div className="mt-lg text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary dark:text-primary-300 font-bold hover:underline"
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
