import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form } from "../../components/Form";
import { TextInput, SelectInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { authService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";

interface LoginValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [step, setStep] = useState<"login" | "select-business">("login");
  const [userId, setUserId] = useState<string>("");

  const INITIAL_VALUES: LoginValues = { email: "", password: "" };
  const BUSINESS_SELECTION_VALUES = { business: "" };

  const handleLogin = async (values: LoginValues) => {
    setLoading(true);
    setError(null);
    try {
      const authData = await authService.login(values.email, values.password);
      if (!authData.user) throw new Error("Login failed");

      const profile = await authService.getProfile(authData.user);
      const userBusinesses = profile.business_users.map((bu) => ({
        id: bu.business_id,
        name: bu.business.business_name,
      }));

      if (userBusinesses.length === 0) {
        // No business assigned – maybe redirect to onboarding
        throw new Error(
          "Your account is not associated with any business. Please contact support.",
        );
      }

      setUserId(profile.id);

      if (userBusinesses.length === 1) {
        // Only one business – set it and go to dashboard
        await authService.switchBusiness(profile.id, userBusinesses[0].id);
        await refreshProfile();
        navigate("/dashboard");
      } else {
        // Multiple businesses – let user choose
        setBusinesses(userBusinesses);
        setSelectedBusinessId(userBusinesses[0].id);
        setStep("select-business");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelect = async () => {
    if (!selectedBusinessId) return;
    setLoading(true);
    setError(null);
    try {
      await authService.switchBusiness(userId, selectedBusinessId);
      await refreshProfile();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("login");
    setError(null);
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

        {step === "login" ? (
          <>
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
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-center mb-xs text-gray-900">
              Select Business
            </h2>
            <p className="text-center text-gray-400 mb-xl font-medium">
              You have access to multiple businesses
            </p>

            {error && (
              <div className="mb-lg p-sm bg-red-50 text-red-500 rounded-xl text-sm font-bold text-center border border-red-100">
                {error}
              </div>
            )}

            <Form
              initialValues={BUSINESS_SELECTION_VALUES}
              onSubmit={handleBusinessSelect}
              className="space-y-md"
            >
              <SelectInput
                label="Choose a business"
                name="business"
                value={selectedBusinessId}
                options={businesses.map((b) => ({
                  label: b.name,
                  value: b.id,
                }))}
              />

              <div className="flex space-x-sm pt-sm">
                <Button
                  variant="secondary"
                  onClick={handleBackToLogin}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleBusinessSelect}
                  loading={loading}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
