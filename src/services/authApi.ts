import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import api from "../lib/api";

// ========================================================================
// TYPE DEFINITIONS
// ========================================================================

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface LoginCredentials {
  email?: string;
  password?: string;
}

interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

// ========================================================================
// API FUNCTIONS
// ========================================================================

const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", credentials);
  return data;
};

const registerUser = async (userData: RegisterCredentials): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", userData);
  return data;
};

// --- HÀM MỚI ---
/**
 * Gửi mã 2FA đến backend để xác thực và hoàn tất đăng nhập.
 * @param code - Mã 6 số từ ứng dụng xác thực.
 * @returns {Promise<AuthResponse>} Dữ liệu người dùng và access token đầy đủ.
 */
export const verify2FA = async (code: string): Promise<AuthResponse> => {
  // Backend endpoint này yêu cầu "token tạm thời" trong header
  const { data } = await api.post<AuthResponse>("/2fa/authenticate", { code });
  return data;
};

// ========================================================================
// CUSTOM HOOKS
// ========================================================================

export const useLoginMutation = (
  options?: Omit<
    UseMutationOptions<AuthResponse, Error, LoginCredentials>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: loginUser,
    ...options,
  });
};

export const useRegisterMutation = (
  options?: Omit<
    UseMutationOptions<User, Error, RegisterCredentials>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: registerUser,
    ...options,
  });
};
