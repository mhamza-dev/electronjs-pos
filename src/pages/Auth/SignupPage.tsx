import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { businessService, rbacService, authService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import { useAPI } from "../../hooks/useAPI";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const {
    loading: signupLoading,
    error: signupError,
    request: signup,
  } = useAPI(authService.signup);

  const {
    loading: createBusinessLoading,
    error: createBusinessError,
    request: createBusiness,
  } = useAPI(businessService.createBusiness);

  const handleSignup = async (values: any) => {
    // 1. Create auth user
    const authData = await signup(
      values.email,
      values.password,
      values.fullName,
    );
    if (!authData.user) throw new Error("Signup failed");

    const userId = authData.user.id;

    // 2. Create the business (owner = current user)
    const newBusiness = await createBusiness({
      owner_user_id: userId,
      business_name: values.businessName,
      legal_name: values.businessName, // or separate field if desired
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency_code: "USD",
    });

    // 3. Assign the 'admin' role to the owner
    // First, find the admin role for the new business
    const roles = await rbacService.getRoles(newBusiness.id);
    const adminRole = roles.find((r) => r.role_name === "admin");
    if (adminRole) {
      await rbacService.assignRoleToUser(
        newBusiness.id,
        userId,
        adminRole.id,
        userId, // assigned by self
      );
    }

    // 4. Set current business in user_settings
    await authService.switchBusiness(userId, newBusiness.id);

    // 5. Refresh profile to pick up the new business context
    await refreshProfile();

    alert(
      "Account created successfully! Please check your inbox and verify your email.",
    );
    navigate("/login");
  };

  const errorMessage = signupError || createBusinessError;

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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-center mb-xs text-gray-900 tracking-tight">
          Create Account
        </h2>
        <p className="text-center text-gray-400 mb-xl font-medium">
          Get started with your POS account
        </p>

        {errorMessage && (
          <div className="mb-lg p-sm bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center border border-red-100">
            {errorMessage}
          </div>
        )}

        <Form
          initialValues={{
            fullName: "",
            email: "",
            password: "",
            businessName: "",
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

          <div className="pt-sm">
            <Button
              inForm={true}
              type="submit"
              className="w-full"
              loading={createBusinessLoading || signupLoading}
            >
              Sign Up Now
            </Button>
          </div>
        </Form>
        <div className="mt-lg text-center">
          <p className="text-gray-500 font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
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
