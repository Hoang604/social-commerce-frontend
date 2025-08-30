// src/pages/auth/SocialCallbackPage.tsx
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useExchangeCodeForTokenMutation } from "../../services/authApi";
import { useToast } from "../../components/ui/use-toast";

export function SocialCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation(); // [2] Dùng để đọc URL
  const loginAction = useAuthStore((state) => state.login);
  const { toast } = useToast();
  const effectRan = useRef(false);

  // [3] Sử dụng mutation hook mới và định nghĩa các callback
  const { mutate: exchangeCode } = useExchangeCodeForTokenMutation({
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: "Đăng nhập thành công!",
      });
      console.log("User data from social login:", data.user);
      console.log("Access Token from social login:", data.accessToken);
      loginAction(data.user, data.accessToken);
      navigate("/dashboard", { replace: true });
    },
    onError: (error: any) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.response?.data?.message || "Vui lòng thử lại.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
    },
  });

  // [4] Logic chính được chạy một lần khi trang được tải
  useEffect(() => {
    // Lấy query params từ URL, ví dụ: ?code=abc123xyz
    if (effectRan.current) return;
    effectRan.current = true;
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      exchangeCode(code);
    } else {
      toast({
        title: "Lỗi xác thực",
        description: "Không tìm thấy mã xác thực trong URL.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
    }
  }, []);

  // [5] Giao diện hiển thị trong lúc chờ đợi
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        {/* Bạn có thể thêm một component Spinner đẹp hơn ở đây */}
        <p className="text-lg font-medium">
          Đang hoàn tất đăng nhập, vui lòng đợi...
        </p>
      </div>
    </div>
  );
}
