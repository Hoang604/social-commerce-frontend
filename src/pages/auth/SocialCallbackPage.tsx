// src/pages/auth/SocialCallbackPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export function SocialCallbackPage() {
  const navigate = useNavigate();
  const verifySession = useAuthStore(
    (state) => state.verifySessionAndFetchUser
  );

  useEffect(() => {
    const handleVerification = async () => {
      try {
        await verifySession();
        // Nếu thành công, chuyển hướng đến dashboard
        navigate("/dashboard", { replace: true });
      } catch (error: any) {
        // Nếu lỗi yêu cầu 2FA, chuyển hướng đến trang xác thực
        if (error?.requires2FA) {
          navigate("/verify-2fa", { replace: true });
        } else {
          // Với các lỗi khác, quay về trang đăng nhập
          // Cần có toast thông báo lỗi ở đây
          alert("Đăng nhập thất bại. Vui lòng thử lại.");
          navigate("/login", { replace: true });
        }
      }
    };

    handleVerification();
  }, [verifySession, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        {/* Spinner component nên được đặt ở đây */}
        <p className="text-lg font-medium">Đang xác thực, vui lòng đợi...</p>
      </div>
    </div>
  );
}
