import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

// --- Get Facebook Auth URL ---
const getFacebookAuthUrl = async () => {
  const { data } = await api.get("/facebook/connect/auth-url");
  return data.authUrl;
};

export const useFacebookAuthUrlQuery = (options = {}) => {
  return useQuery({
    queryKey: ["facebookAuthUrl"],
    queryFn: getFacebookAuthUrl,
    enabled: false, // Chỉ fetch khi được gọi bằng refetch()
    ...options,
  });
};

// --- Get Pending Pages ---
const getPendingPages = async () => {
  const { data } = await api.get("/facebook/connect/pending-pages");
  return data.pages;
};

export const usePendingPagesQuery = () => {
  return useQuery({
    queryKey: ["pendingPages"],
    queryFn: getPendingPages,
  });
};

// --- Connect Pages ---
const connectPages = async (
  pages: { facebookPageId: string; pageName: string }[]
) => {
  const { data } = await api.post("/connected-pages", { pages });
  return data;
};

export const useConnectPagesMutation = () => {
  return useMutation({
    mutationFn: connectPages,
  });
};

interface AuthUrlResponse {
  authUrl: string;
}

interface ConnectPagesPayload {
  code: string;
}

// === QUERY KEYS ===
// Key này cần được export để các nơi khác có thể sử dụng khi invalidate
export const connectedPagesQueryKey = ["connectedPages"];

// === MUTATION HOOKS ===

/**
 * Lấy URL xác thực từ backend để bắt đầu luồng kết nối Facebook.
 */
export const useFacebookAuthUrlMutation = () => {
  return useMutation<AuthUrlResponse>({
    mutationFn: () => api.get("/facebook-connect/auth-url"),
    onSuccess: (data) => {
      // Tự động chuyển hướng người dùng đến trang xác thực của Facebook
      window.location.href = data.authUrl;
    },
    onError: (error) => {
      // Cần có Toast để thông báo lỗi cho người dùng
      console.error("Could not get Facebook auth URL", error);
      alert("Đã có lỗi xảy ra. Không thể bắt đầu quá trình kết nối.");
    },
  });
};

/**
 * Gửi authorization code lấy từ Facebook callback về backend để hoàn tất kết nối.
 */
export const useConnectFacebookPagesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConnectPagesPayload) =>
      api.post("/facebook-connect/connect-pages", payload),
    onSuccess: () => {
      // Làm mới lại danh sách các trang đã kết nối
      queryClient.invalidateQueries({ queryKey: connectedPagesQueryKey });
    },
    // Logic điều hướng và hiển thị toast sẽ được xử lý trong component
  });
};
