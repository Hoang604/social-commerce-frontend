import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../services/authApi";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import AuthLayout from "../../components/layout/AuthLayout";
import { toast } from "../../components/ui/Toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: loginAction, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { mutate: login, isPending } = useLoginMutation({
    onSuccess: (data: { accessToken?: string; user?: any }) => {
      // API trả về accessToken và có thể có user data
      // Trường hợp 2FA, data chỉ có partial accessToken
      if (data.accessToken && data.user) {
        loginAction(data.user, data.accessToken);
        navigate("/dashboard");
      } else {
        // YÊU CẦU 2FA: Backend đã set cookie, chỉ cần điều hướng
        navigate("/verify-2fa");
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Invalid email or password.";
      toast.error(errorMessage);
    },
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <AuthLayout title="Login to your Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
        >
          Login
        </Button>
        <div className="text-center text-sm">
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary-500 hover:text-primary-600"
            >
              Register
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
