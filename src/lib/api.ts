// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});

// --- Interceptor 1: Ghi log và đính kèm Access Token cho mỗi Request ---
api.interceptors.request.use(
  (config) => {
    // Lấy token từ store
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // --- LOGGING ---
    console.groupCollapsed(
      `[API Request] >> ${config.method?.toUpperCase()} ${config.url}`
    );
    console.log("Headers:", config.headers);
    if (config.data) {
      console.log("Body:", config.data);
    }
    console.groupEnd();
    // --- END LOGGING ---

    return config;
  },
  (error) => {
    // --- LOGGING ---
    console.error("[API Request Error]", error);
    // --- END LOGGING ---
    return Promise.reject(error);
  }
);

// --- Interceptor 2: Ghi log và xử lý Response/Error ---
api.interceptors.response.use(
  (response) => {
    // --- LOGGING ---
    console.groupCollapsed(
      `[API Response] << ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    console.log("Data:", response.data);
    console.groupEnd();
    // --- END LOGGING ---

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // --- LOGGING ---
    // Log lỗi trước khi xử lý
    console.groupCollapsed(
      `[API Error] << ${
        error.response?.status
      } ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`
    );
    console.error("Error Response:", error.response?.data);
    console.error("Original Request:", originalRequest);
    console.groupEnd();
    // --- END LOGGING ---

    // Logic xử lý refresh token đã có
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Access Token expired. Attempting to refresh...");
        const { data } = await api.get("/auth/refresh");

        useAuthStore.getState().setAccessToken(data.accessToken);
        console.log("Token refreshed successfully.");

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        console.log("Retrying original request...");
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token. Logging out.", refreshError);
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
