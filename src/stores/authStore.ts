// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";
import { AxiosError } from "axios";
import { redirect } from "react-router-dom";

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

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: (userData: User) => void;
  setState: (state: Partial<AuthState>) => void;
  setAccessToken: (token: string | null) => void;
  verifySessionAndFetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (userData, token) =>
        set({ user: userData, accessToken: token, isAuthenticated: true }),

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          set({ user: null, accessToken: null, isAuthenticated: false });
          redirect("/login");
        }
      },
      setState: (state) => set((s) => ({ ...s, ...state })),
      setUser: (userData) => set((state) => ({ ...state, user: userData })),
      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: !!token }),

      verifySessionAndFetchUser: async () => {
        try {
          const { data: user } = await api.get<User>("/user/me");

          if (user && user.id) {
            const accessToken = get().accessToken;

            if (accessToken) {
              get().login(user, accessToken);
              return;
            }
          }

          throw new Error("Invalid session data from server");
        } catch (error) {
          const axiosError = error as AxiosError;
          if (
            axiosError.response?.status === 401 &&
            (axiosError.response?.data as any)?.message ===
              "Two factor authentication required"
          ) {
            return Promise.reject({ requires2FA: true });
          }
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
