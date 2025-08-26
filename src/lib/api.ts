import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});

// Interceptor cũ: Thêm Access Token vào mỗi request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor MỚI: Xử lý khi Access Token hết hạn
api.interceptors.response.use(
  (response) => response, // Nếu response thành công, không làm gì cả
  async (error) => {
    const originalRequest = error.config;
    // Kiểm tra nếu lỗi là 401 và request này chưa phải là request thử lại
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại

      try {
        // Gọi đến endpoint /refresh để lấy accessToken mới
        // Backend sẽ trả về { accessToken, user }
        const { data } = await api.post("/auth/refresh");

        // SỬA LỖI Ở ĐÂY: Dùng hàm login() để cập nhật store
        useAuthStore.getState().login(data.user, data.accessToken);

        // Cập nhật header của request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Thực hiện lại request gốc đã thất bại
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh cũng thất bại, logout người dùng
        useAuthStore.getState().logout();
        window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
