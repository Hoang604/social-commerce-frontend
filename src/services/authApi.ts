import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import api from "../lib/api";

// ========================================================================
// TYPE DEFINITIONS - Định nghĩa cấu trúc dữ liệu một cách chặt chẽ
// ========================================================================

/**
 * Đại diện cho đối tượng người dùng.
 */
interface User {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Dữ liệu trả về sau khi đăng nhập thành công.
 */
interface AuthResponse {
  accessToken: string;
  user: User;
}

/**
 * Dữ liệu cần thiết để đăng nhập.
 * Có thể là email/password hoặc chỉ mã 2FA.
 */
interface LoginCredentials {
  email?: string;
  password?: string;
  code?: string; // Dùng cho luồng xác thực 2 yếu tố
}

/**
 * Dữ liệu cần thiết để đăng ký tài khoản mới.
 */
interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

// ========================================================================
// API FUNCTIONS - Các hàm bất đồng bộ để tương tác với backend
// ========================================================================

/**
 * Gửi yêu cầu đăng nhập đến backend.
 * Hàm này xử lý cả đăng nhập thông thường và xác thực 2FA.
 * @param credentials - Thông tin đăng nhập (email/password hoặc code 2FA).
 * @returns {Promise<AuthResponse>} Dữ liệu người dùng và access token.
 */
const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", credentials);
  return data;
};

/**
 * Gửi yêu cầu đăng ký tài khoản mới đến backend.
 * @param userData - Thông tin người dùng mới.
 * @returns {Promise<User>} Thông tin người dùng vừa được tạo.
 */
const registerUser = async (userData: RegisterCredentials): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", userData);
  return data;
};

// ========================================================================
// CUSTOM HOOKS - Các hook của TanStack Query để sử dụng trong components
// ========================================================================

/**
 * Hook để thực hiện mutation đăng nhập.
 * Nó bao bọc hàm `loginUser` và có thể được sử dụng trong `LoginPage` và `Verify2faPage`.
 */
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

/**
 * Hook để thực hiện mutation đăng ký.
 * Nó bao bọc hàm `registerUser` và được sử dụng trong `RegisterPage`.
 */
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
