// src/pages/auth/Verify2faPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../services/authApi"; // SỬA LỖI: Dùng lại login mutation
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import AuthLayout from "../../components/layout/AuthLayout";
import { toast } from "../../components/ui/Toast";

const Verify2faPage = () => {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  // SỬA LỖI: Sử dụng useLoginMutation để hoàn tất đăng nhập sau khi có mã 2FA
  const { mutate: verifyAndLogin, isPending } = useLoginMutation({
    onSuccess: (data) => {
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
    // Gửi mã 2FA như một phần của thông tin đăng nhập
    verifyAndLogin({ code });
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
          pattern="\\d{6}"
        />
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Verifying..." : "Verify Code"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Verify2faPage;
