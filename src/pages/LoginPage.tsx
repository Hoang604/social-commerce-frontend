import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../services/authApi";
import { useAuthStore } from "../stores/authStore";
// Giả định đã có component Button và Input từ /components/ui
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';

const LoginPage = () => {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const { mutate: login, isPending } = useLoginMutation({
    onSuccess: (data) => {
      // API trả về accessToken và có thể có user data
      // Trường hợp 2FA, data chỉ có partial accessToken
      if (data.accessToken && data.user) {
        // THÀNH CÔNG (2FA không bật)
        loginAction(data.user, data.accessToken);
        navigate("/dashboard");
      } else {
        // YÊU CẦU 2FA
        // Backend đã set cookie, chỉ cần điều hướng
        navigate("/verify-2fa");
      }
    },
    onError: (error) => {
      // Hiển thị Toast Notification lỗi
      console.error("Login failed:", error);
      // alert('Invalid email or password');
    },
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={isPending}>
          {isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
