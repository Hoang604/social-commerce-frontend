// src/services/settingsApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

// === TYPES ===
// SỬA LỖI: Bổ sung các định nghĩa type cần thiết cho frontend
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  isTwoFactorAuthenticationEnabled: boolean;
  // Các trường khác có thể được thêm vào khi cần
}
// === TYPES ===
interface UpdateProfilePayload {
  fullName?: string;
  avatarUrl?: string;
}

interface Generate2faResponse {
  otpAuthUrl: string;
}

interface TurnOn2faPayload {
  twoFactorAuthenticationCode: string;
}

interface TurnOff2faPayload {
  password?: string;
  twoFactorAuthenticationCode?: string;
}

interface ConnectedPage {
  id: string;
  name: string;
  createdAt: string;
}

// === QUERY KEYS ===
const settingsKeys = {
  profile: ["userProfile"] as const,
  connectedPages: ["connectedPages"] as const,
};

// === USER PROFILE HOOKS ===
export const useUserProfileQuery = () => {
  return useQuery<User>({
    queryKey: settingsKeys.profile,
    queryFn: async () => {
      const response = await api.get("/user/me");
      return response.data;
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      api.patch("/user/me", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
      // Here you would typically show a success toast
    },
    onError: (error) => {
      // Here you would typically show an error toast
      console.error("Failed to update profile:", error);
    },
  });
};

// === 2FA SECURITY HOOKS ===
export const useGenerate2faMutation = () => {
  return useMutation<Generate2faResponse>({
    mutationFn: () => api.post("/2fa/generate"),
  });
};

export const useTurnOn2faMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TurnOn2faPayload) =>
      api.post("/2fa/turn-on", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
    },
  });
};

export const useTurnOff2faMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TurnOff2faPayload) =>
      api.post("/2fa/turn-off", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile });
    },
  });
};

// === CONNECTIONS HOOKS ===
export const useConnectedPagesQuery = () => {
  return useQuery<ConnectedPage[]>({
    queryKey: settingsKeys.connectedPages,
    queryFn: async () => {
      const response = await api.get("/connected-pages");
      return response.data;
    },
  });
};

export const useDisconnectPageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => api.delete(`/connected-pages/${pageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.connectedPages });
    },
  });
};
