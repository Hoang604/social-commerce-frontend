// src/pages/FacebookCallbackPage.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useConnectFacebookPagesMutation } from "../services/facebookApi";

export function FacebookCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: connectPages } = useConnectFacebookPagesMutation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code) {
      connectPages(
        { code },
        {
          onSuccess: () => {
            // Sau này sẽ thay bằng toast notification
            alert("Kết nối trang thành công!");
            navigate("/dashboard", { replace: true });
          },
          onError: () => {
            // Sau này sẽ thay bằng toast notification
            alert("Kết nối trang thất bại. Vui lòng thử lại.");
            navigate("/settings/connections", { replace: true });
          },
        }
      );
    } else {
      // Trường hợp không có 'code', có thể do người dùng từ chối hoặc có lỗi
      alert("Quá trình xác thực đã bị hủy bỏ hoặc có lỗi xảy ra.");
      navigate("/settings/connections", { replace: true });
    }
  }, [location, navigate, connectPages]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* Có thể thêm Spinner component ở đây */}
      <p className="text-lg text-gray-700">
        Đang hoàn tất quá trình kết nối, vui lòng đợi...
      </p>
    </div>
  );
}
