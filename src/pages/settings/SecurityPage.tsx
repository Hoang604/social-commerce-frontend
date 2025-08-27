// src/pages/settings/SecurityPage.tsx
import { useUserProfileQuery } from "../../services/settingsApi"; // SỬA LỖI: Đường dẫn tương đối
import { Button } from "../../components/ui/Button"; // SỬA LỖI: Đường dẫn tương đối

export function SecurityPage() {
  const { data: user, isLoading } = useUserProfileQuery();

  const handleEnable2FA = () => alert("Modal to enable 2FA opens");
  const handleDisable2FA = () => alert("Modal to disable 2FA opens");

  if (isLoading) return <div>Loading security settings...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Security</h1>
      <div className="p-4 border rounded-md max-w-md">
        <h2 className="font-semibold">Two-Factor Authentication (2FA)</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add an extra layer of security to your account.
        </p>
        <div className="mt-4">
          {user?.isTwoFactorAuthenticationEnabled ? (
            <div className="flex items-center justify-between">
              <p className="text-green-600 font-medium">2FA is enabled</p>
              <Button variant="destructive" onClick={handleDisable2FA}>
                Disable 2FA
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-800 font-medium">2FA is disabled</p>
              <Button onClick={handleEnable2FA}>Enable 2FA</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
