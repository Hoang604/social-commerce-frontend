import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import api from "../lib/api";

// Định nghĩa interfaces cho response
interface LoginResponse {
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
}

// --- Login Mutation ---
const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const useLoginMutation = (
  options?: Omit<
    UseMutationOptions<LoginResponse, Error, LoginCredentials>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: login,
    ...options,
  });
};

// --- Register Mutation ---
const register = async (
  userData: RegisterCredentials
): Promise<RegisterResponse> => {
  console.log(
    "API: Sending registration request to:",
    `${api.defaults.baseURL}/auth/register`
  );
  console.log("API: Registration data:", { ...userData, password: "***" });

  try {
    const { data } = await api.post("/auth/register", userData);
    console.log("API: Registration successful:", data);
    return data;
  } catch (error) {
    console.error("API: Registration failed:", error);
    throw error;
  }
};

export const useRegisterMutation = (
  options?: Omit<
    UseMutationOptions<RegisterResponse, Error, RegisterCredentials>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: register,
    ...options,
  });
};

// --- Verify 2FA Mutation ---
const verify2fa = async (payload: { code: string }) => {
  const { data } = await api.post("/2fa/authenticate", payload);
  return data;
};

export const useVerify2faMutation = (
  options?: UseMutationOptions<any, Error, { code: string }>
) => {
  return useMutation({
    mutationFn: verify2fa,
    ...options,
  });
};
