import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import { Button } from "../../components/Buttons";
import { UserProfile } from "../../data/type";
import { useAPI } from "../../hooks/useAPI";
import { authService } from "../../services";
import ChangePassword from "./ChangePassword";

const ProfileSettings: React.FC<{
  profile: UserProfile | null;
  onUpdate: () => void;
}> = ({ profile, onUpdate }) => {
  const { request: updateProfile, loading } = useAPI(
    async (values: { full_name: string; email: string }) => {
      // Update auth user metadata (full_name) and email if changed
      await authService.updateProfile(values);
      onUpdate();
    },
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Profile Form */}
        <div className="col-span-1">
          <Form
            initialValues={{
              full_name: profile?.full_name || "",
              email: profile?.email || "",
            }}
            onSubmit={updateProfile}
          >
            <TextInput name="full_name" label="Full Name" required />
            <TextInput name="email" label="Email" type="email" disabled />
            <div className="mt-4">
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </div>
          </Form>
        </div>

        {/* Right Column: Change Password */}
        <div className="col-span-1">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
