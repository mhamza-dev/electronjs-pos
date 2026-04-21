import { Button } from "../../components/Buttons";
import { Form } from "../../components/Form";
import { TextInput } from "../../components/Inputs";
import { useAPI } from "../../hooks/useAPI";
import { authService } from "../../services";

const ChangePassword: React.FC = () => {
  const { request: changePassword, loading } = useAPI(
    authService.changePassword,
  );
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Change Password</h3>
      <Form
        initialValues={{
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }}
        onSubmit={async (values) => {
          if (values.newPassword !== values.confirmPassword)
            throw new Error("Passwords do not match");
          await changePassword(values.currentPassword, values.newPassword);
        }}
      >
        <TextInput
          name="currentPassword"
          label="Current Password"
          type="password"
          required
        />
        <TextInput
          name="newPassword"
          label="New Password"
          type="password"
          required
        />
        <TextInput
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          required
        />
        <Button type="submit" loading={loading}>
          Update Password
        </Button>
      </Form>
    </div>
  );
};

export default ChangePassword;
