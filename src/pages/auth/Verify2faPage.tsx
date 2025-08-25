import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVerify2faMutation } from "../../services/authApi";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import AuthLayout from "../../components/layout/AuthLayout";
import { toast } from "../../components/ui/Toast";

const Verify2faPage = () => {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const { mutate: verifyCode, isPending } = useVerify2faMutation({
    onSuccess: (data) => {
      // Sau khi xác thực 2FA thành công, backend trả về accessToken và user
      toast.success("Successfully authenticated!");
      loginAction(data.user, data.accessToken);
      navigate("/dashboard", { replace: true });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Invalid authentication code.";
      toast.error(errorMessage);
    },
  });

  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    verifyCode({ code });
  };

  return (
    <AuthLayout title="Two-Factor Authentication">
      <div className="text-center text-sm text-neutral-600 mb-6">
        <p>Please enter the 6-digit code from your authenticator app.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          required
          disabled={isPending}
          maxLength={6}
          inputMode="numeric"
          pattern="\d{6}"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
        >
          Verify Code
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Verify2faPage;
