// src/services/settingsApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

// === TYPES ===
// Định nghĩa các kiểu dữ liệu cho request và response
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  isTwoFactorAuthenticationEnabled: boolean;
  language: string;
  timezone: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
}

interface UpdateProfilePayload {
  fullName?: string;
  avatarUrl?: string;
  language?: string;
  timezone?: string;
}

// Dữ liệu backend trả về khi tạo mã QR
interface Generate2FAResponse {
  qrCodeDataURL: string;
}

// Dữ liệu backend trả về khi bật 2FA thành công
interface TurnOn2FAResponse {
  message: string;
  recoveryCodes: string[];
}

interface ConnectedPage {
  id: string;
  facebookPageId: string;
  pageName: string;
  createdAt: string;
}

interface ChangePasswordResponse {
  message: string;
  accessToken: string;
}

// Thêm vào đầu file src/services/settingsApi.ts

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface RequestEmailChangePayload {
  newEmail: string;
  password: string;
}

// === QUERY KEYS ===

export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  const response = await api.post("/auth/change-password", payload);
  return response.data;
};

export const requestEmailChange = async (
  payload: RequestEmailChangePayload
): Promise<{ message: string }> => {
  const response = await api.post("/user/request-email-change", payload);
  return response.data;
};

const settingsKeys = {
  profile: ["me"] as const, // Đổi thành 'me' để khớp với các file khác
  connectedPages: ["connectedPages"] as const,
};

// === API FUNCTIONS ===
// Tách logic gọi API ra các hàm riêng biệt
export const fetchUserProfile = async (): Promise<User> => {
  const response = await api.get("/user/me");
  return response.data;
};

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<User> => {
  const response = await api.patch("/user/me", payload);
  return response.data;
};

export const generate2FASecret = async (): Promise<Generate2FAResponse> => {
  const response = await api.post("/2fa/generate");
  return response.data;
};

export const turnOn2FA = async (code: string): Promise<TurnOn2FAResponse> => {
  const response = await api.post("/2fa/turn-on", { code });
  return response.data;
};

export const disable2FA = async (
  code: string
): Promise<{ message: string }> => {
  const response = await api.post("/2fa/turn-off", { code });
  return response.data;
};

export const fetchConnectedPages = async (): Promise<ConnectedPage[]> => {
  const response = await api.get("/connected-pages");
  return response.data;
};

export const disconnectPage = async (pageId: string): Promise<void> => {
  await api.delete(`/connected-pages/${pageId}`);
};

// === REACT QUERY HOOKS ===
// Các hooks này sẽ sử dụng các hàm API ở trên

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

export const useRequestEmailChangeMutation = () => {
  return useMutation({
    mutationFn: requestEmailChange,
  });
};

export const useUserProfileQuery = () => {
  return useQuery<User>({
    queryKey: settingsKeys.profile,
    queryFn: fetchUserProfile,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
    },
  });
};

export const useGenerate2faMutation = () => {
  return useMutation<Generate2FAResponse>({
    mutationFn: generate2FASecret,
  });
};

export const useTurnOn2faMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<TurnOn2FAResponse, Error, string>({
    // <TData, TError, TVariables>
    mutationFn: (code: string) => turnOn2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
    },
  });
};

export const useDisable2faMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (code: string) => disable2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
    },
  });
};

export const useConnectedPagesQuery = () => {
  return useQuery<ConnectedPage[]>({
    queryKey: settingsKeys.connectedPages,
    queryFn: fetchConnectedPages,
  });
};

export const useDisconnectPageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.connectedPages });
    },
  });
};
