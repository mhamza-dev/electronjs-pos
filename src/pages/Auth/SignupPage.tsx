import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form } from "../../components/Form";
import { TextInput, SelectInput } from "../../components/Form/Inputs";
import { Button } from "../../components/Buttons";
import { businessService } from "../../services/business";
import { authService } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<
    { value: string; label: string }[]
  >([]);
  const [signupType, setSignupType] = useState<"create" | "join">("create");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const data = await businessService.getAllBusinesses();
      if (data) {
        setBusinesses(data.map((b) => ({ value: b.id, label: b.name })));
      }
    } catch (err) {
      console.error("Failed to fetch businesses");
    }
  };

  const handleSignup = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Auth Signup
      const authData = await authService.signup(
        values.email,
        values.password,
        values.fullName,
      );
      if (!authData.user) throw new Error("Signup failed");

      // 2. Business Logic
      if (signupType === "create") {
        await businessService.createBusiness(
          values.businessName,
          authData.user.id,
        );
      } else {
        if (!values.businessId)
          throw new Error("Please select a business to join");
        await businessService.joinBusiness(values.businessId, authData.user.id);
      }

      await refreshProfile();
      alert("Account created successfully! You can now login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md bg-gray-50 font-poppins">
      <div className="w-width-card-lg p-lg bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-center mb-xl">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-100">
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

        {error && (
          <div className="mb-lg p-sm bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="flex p-sm bg-gray-50 rounded-xl mb-xl space-x-sm">
          <button
            onClick={() => setSignupType("create")}
            className={`flex-1 py-sm rounded-lg font-bold transition-all ${signupType === "create" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
          >
            Create Business
          </button>
          <button
            onClick={() => setSignupType("join")}
            className={`flex-1 py-sm rounded-lg font-bold transition-all ${signupType === "join" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
          >
            Join Business
          </button>
        </div>

        <Form
          initialValues={{
            fullName: "",
            email: "",
            password: "",
            businessName: "",
            businessId: "",
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

          {signupType === "create" ? (
            <TextInput
              name="businessName"
              label="Business Name"
              placeholder="My Awesome Shop"
              required
            />
          ) : (
            <SelectInput
              name="businessId"
              label="Select Business"
              options={businesses}
              required
            />
          )}

          <div className="pt-sm">
            <Button type="submit" className="w-full" loading={loading}>
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
