// src/components/layout/DashboardLayout.tsx
import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUserProfileQuery } from "../../services/settingsApi";
import { Button } from "../ui/Button";

export function DashboardLayout() {
  const logout = useAuthStore((state) => state.logout);
  const { data: user } = useUserProfileQuery();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-xl font-bold">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span>Chào, {user?.fullName || user?.email}</span>
          {/* Tạm thời dùng Link/Button, sau này sẽ nâng cấp thành DropdownMenu */}
          <Link to="/settings/profile">
            <Button variant="outline">Cài đặt</Button>
          </Link>
          <Button onClick={logout} variant="destructive">
            Đăng xuất
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        {/* Outlet sẽ render nội dung của các trang con, ví dụ DashboardPage */}
        <Outlet />
      </main>
    </div>
  );
}
