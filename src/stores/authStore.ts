import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  fullName: string;
  // Thêm các thuộc tính khác của user nếu cần
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: (userData: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (userData, token) =>
        set({ user: userData, accessToken: token, isAuthenticated: true }),
      logout: () => {
        // Cần thêm logic gọi API logout ở đây trong tương lai
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      setUser: (userData) => set((state) => ({ ...state, user: userData })),
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
    }
  )
);
