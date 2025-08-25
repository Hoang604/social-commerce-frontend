import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  // withCredentials: true, // Tạm thời tắt để tránh CORS preflight - sẽ bật lại khi backend fix CORS
});

// Interceptor để tự động thêm Access Token vào mỗi request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
