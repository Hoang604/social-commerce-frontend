// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../services/authApi";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import AuthLayout from "../../components/layout/AuthLayout";
import { toast } from "../../components/ui/Toast";

const LoginPage = () => {
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login, isPending } = useLoginMutation({
    onSuccess: (data) => {
      loginAction(data.user, data.accessToken);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      if (
        error.response?.status === 401 &&
        error.response?.data?.message === "Two factor authentication required"
      ) {
        // Lưu email vào session storage để trang 2FA có thể sử dụng nếu cần
        sessionStorage.setItem("emailFor2fa", email);
        navigate("/verify-2fa");
      } else {
        toast.error(
          error.response?.data?.message || "Email hoặc mật khẩu không hợp lệ."
        );
      }
    },
  });

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  const handleFacebookLogin = () => {
    setIsFacebookLoading(true);
    // Trỏ trực tiếp đến endpoint của backend để bắt đầu luồng OAuth2
    const facebookAuthUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/auth/facebook`;
    window.location.href = facebookAuthUrl;
  };

  return (
    <AuthLayout title="Đăng nhập vào tài khoản">
      <div className="w-full max-w-sm">
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-4">
            <Input
              id="email-address"
              type="email"
              autoComplete="email"
              required
              placeholder="Địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending || isFacebookLoading}
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending || isFacebookLoading}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isFacebookLoading}
            >
              {isPending ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </div>
        </form>

        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={handleFacebookLogin}
            disabled={isPending || isFacebookLoading}
          >
            {isFacebookLoading
              ? "Đang chuyển hướng..."
              : "Đăng nhập bằng Facebook"}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
