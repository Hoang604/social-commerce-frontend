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

      verifySessionAndFetchUser: async () => {
        try {
          // 1. Request này sẽ thành công (sau khi được interceptor xử lý)
          // và `data` lúc này chính là đối tượng `user`.
          const { data: user } = await api.get<User>("/user/me");

          // 2. Kiểm tra xem có nhận được đối tượng user hợp lệ không.
          if (user && user.id) {
            // 3. accessToken mới đã được lưu vào store bởi interceptor.
            //    Chúng ta chỉ cần lấy nó ra từ state hiện tại.
            const accessToken = get().accessToken;

            if (accessToken) {
              // 4. Gọi action `login` để cập nhật đầy đủ state với `user` và `accessToken`.
              get().login(user, accessToken);
              return; // Hoàn thành và resolve Promise
            }
          }

          // Nếu không có user hoặc accessToken, có lỗi logic xảy ra.
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
