import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../services/authApi";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import AuthLayout from "../../components/layout/AuthLayout";
import { toast } from "../../components/ui/Toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { mutate: register, isPending } = useRegisterMutation({
    onSuccess: () => {
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    },
    onError: (error: any) => {
      console.error("Registration error:", error);

      let errorMessage = "An error occurred during registration.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }

      toast.error(errorMessage);
    },
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    console.log("Attempting to register with:", {
      fullName,
      email,
      password: "***",
    });
    register({ fullName: fullName.trim(), email: email.trim(), password });
  };

  return (
    <AuthLayout title="Create a New Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
          disabled={isPending}
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          disabled={isPending}
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 8 characters)"
          required
          disabled={isPending}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
        >
          Create Account
        </Button>
        <div className="text-center text-sm">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-500 hover:text-primary-600"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
