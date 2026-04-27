import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form } from "../../components/Form";
import { TextInput, SelectInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { signUpWithBusiness } from "../../services/authService"; // only this needed
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../hooks"; // updated hook
import { businessCategoryOptions } from "../../data/constants";
import logo from "../../assets/logo.svg";
import { SignUpParams } from "../../services/authService";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const adaptedSignUp = async (params: SignUpParams) => {
    const response = await signUpWithBusiness(params);
    return { data: response, error: response.error };
  };

  const {
    loading: signupLoading,
    error: signupError,
    request: signup,
  } = useApi(adaptedSignUp);

  const handleSignup = async (values: any) => {
    // Call the wrapper – the hook will unwrap and throw on error
    const result = await signup({
      email: values.email,
      password: values.password,
      full_name: values.fullName,
      business_name: values.businessName,
      business_type: values.business_category,
    });

    // result is now { data: AuthResponse, error: null } (or thrown)
    // result is the 'data' property returned by the hook
    if (result?.session) {
      // Email confirmation disabled – user is logged in immediately
      await refreshProfile();
      navigate("/dashboard");
    } else {
      // Email confirmation required
      alert("Account created! Please check your inbox and verify your email.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md bg-gray-50 dark:bg-gray-950 font-poppins">
      <div className="w-width-card-lg p-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-md">
          <img src={logo} alt="Vendora" className="w-24 h-24" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-xs text-gray-900 dark:text-gray-100 tracking-tight">
          Create Account
        </h2>
        <p className="text-center text-gray-400 dark:text-gray-500 mb-md font-medium">
          Get started with your Vendora account
        </p>

        {signupError && (
          <div className="mb-lg p-sm bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-800">
            {signupError}
          </div>
        )}

        <Form
          initialValues={{
            fullName: "",
            email: "",
            password: "",
            businessName: "",
            business_category: "Other",
          }}
          onSubmit={handleSignup}
          className="space-y-md"
        >
          <TextInput
            name="fullName"
            label="Full Name"
            placeholder="John Doe"
            required
          />
          <TextInput
            type="email"
            name="email"
            label="Email Address"
            placeholder="john@example.com"
            required
          />
          <TextInput
            type="password"
            name="password"
            label="Password"
            placeholder="••••••••"
            required
          />
          <TextInput
            name="businessName"
            label="Business Name"
            placeholder="My Awesome Shop"
            required
          />
          <SelectInput
            name="business_category"
            label="Business Type"
            options={businessCategoryOptions}
            required
          />
          <div className="pt-sm">
            <Button
              inForm={true}
              type="submit"
              className="w-full"
              loading={signupLoading}
            >
              Sign Up Now
            </Button>
          </div>
        </Form>
        <div className="mt-lg text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary dark:text-primary-300 font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
