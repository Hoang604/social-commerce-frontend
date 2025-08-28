// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import { AxiosError } from "axios";

interface User {
  id: string;
  email: string;
  fullName: string;
  isTwoFactorAuthenticationEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: (userData: User) => void;
  setAccessToken: (token: string | null) => void;
  verifySessionAndFetchUser: () => Promise<void>; // <-- ACTION MỚI
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (userData, token) =>
        set({ user: userData, accessToken: token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      setUser: (userData) => set((state) => ({ ...state, user: userData })),
      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: !!token }),

      // --- ĐỊNH NGHĨA ACTION MỚI ---
      verifySessionAndFetchUser: async () => {
        try {
          const { data } = await api.get("/user/me");
          // `data` được kỳ vọng là { user, accessToken }
          // Backend sẽ trả về accessToken mới sau social login
          if (data.user && data.accessToken) {
            get().login(data.user, data.accessToken);
            return Promise.resolve();
          }
          // Nếu không có accessToken, có thể user đã có session nhưng cần 2FA
          // Trường hợp này sẽ được xử lý trong block catch
          throw new Error("Invalid session data");
        } catch (error) {
          const axiosError = error as AxiosError;
          // Backend trả về 401 và một message đặc biệt khi cần 2FA
          if (
            axiosError.response?.status === 401 &&
            (axiosError.response?.data as any)?.message ===
              "Two factor authentication required"
          ) {
            return Promise.reject({ requires2FA: true });
          }
          // Với các lỗi khác, thực hiện logout để dọn dẹp state
          get().logout();
          return Promise.reject({ requires2FA: false });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
