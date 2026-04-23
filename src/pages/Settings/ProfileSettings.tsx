import React, { useState } from "react";
import { User, Lock } from "lucide-react";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { UserProfile } from "../../data/type";
import { useAPI } from "../../hooks/useAPI";
import { authService } from "../../services";

const ProfileSettings: React.FC<{
  profile: UserProfile | null;
  onUpdate: () => void;
}> = ({ profile, onUpdate }) => {
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { request: updateProfile, loading: profileLoading } = useAPI(
    async (values: { full_name: string; email: string }) => {
      setProfileError(null);
      await authService.updateProfile(values);
      onUpdate();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  );

  const { request: changePassword, loading: passwordLoading } = useAPI(
    authService.changePassword,
  );

  const handlePasswordSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setPasswordError(null);
    if (values.newPassword !== values.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      await changePassword(values.currentPassword, values.newPassword);
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    }
  };

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="space-y-xs">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Profile Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your personal information and account security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Left Column: Profile Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-400/20 flex items-center justify-center text-primary-700 dark:text-primary-300">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Personal Details
            </h3>
          </div>

          {profileError && (
            <div className="mb-md p-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="mb-md p-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm border border-green-100 dark:border-green-800">
              Profile updated successfully!
            </div>
          )}

          <Form
            initialValues={{
              full_name: profile?.full_name || "",
              email: profile?.email || "",
            }}
            onSubmit={updateProfile}
          >
            <TextInput
              name="full_name"
              label="Full Name"
              placeholder="Your full name"
              required
            />
            <TextInput
              name="email"
              label="Email Address"
              type="email"
              disabled
              placeholder="your@email.com"
            />
            <div className="mt-lg">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={profileLoading}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </div>

        {/* Right Column: Change Password */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-lg">
          <div className="flex items-center gap-sm mb-lg">
            <div className="w-8 h-8 rounded-full bg-secondary-50 dark:bg-secondary-400/20 flex items-center justify-center text-secondary-700 dark:text-secondary-300">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Security
            </h3>
          </div>

          {passwordError && (
            <div className="mb-md p-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-md p-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm border border-green-100 dark:border-green-800">
              Password updated successfully!
            </div>
          )}

          <Form
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            onSubmit={handlePasswordSubmit}
          >
            <TextInput
              name="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              required
            />
            <TextInput
              name="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter new password"
              required
            />
            <TextInput
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              required
            />
            <div className="mt-lg">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={passwordLoading}
              >
                Update Password
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
