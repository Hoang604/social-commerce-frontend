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
  isTwoFactorAuthenticationEnabled?: boolean;
  avatarUrl: string;
  language: string;
  timezone: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
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

const registerUser = async (
  userData: RegisterCredentials
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/register", userData);
  return data;
};

// --- NEW FUNCTION ---
/**
 * Sends the 2FA code to the backend for authentication and to complete login.
 * @param code - The 6-digit code from the authenticator app.
 * @returns {Promise<AuthResponse>} Full user data and access token.
 */
export const verify2FA = async (code: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/2fa/authenticate", { code });
  return data;
};

export const exchangeCodeForToken = async (
  code: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/exchange-code", {
    code,
  });
  return data;
};

// ========================================================================
// CUSTOM HOOKS
// ========================================================================

export const useExchangeCodeForTokenMutation = (
  options?: Omit<UseMutationOptions<AuthResponse, Error, string>, "mutationFn">
) => {
  return useMutation({
    mutationFn: exchangeCodeForToken,
    ...options,
  });
};

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
    UseMutationOptions<AuthResponse, Error, RegisterCredentials>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: registerUser,
    ...options,
  });
};
