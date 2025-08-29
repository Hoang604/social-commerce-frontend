// src/components/layout/DashboardLayout.tsx
import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUserProfileQuery } from "../../services/settingsApi";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { ThemeToggleButton } from "../ui/ThemeToggleButton"; // <-- IMPORT NÚT MỚI

export function DashboardLayout() {
  const logout = useAuthStore((state) => state.logout);
  const { data: user } = useUserProfileQuery();

  return (
    // Thêm class dark:
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Dashboard
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* THÊM NÚT CHUYỂN ĐỔI THEME VÀO ĐÂY */}
          <ThemeToggleButton />
          {user && <Avatar src={user.avatarUrl} name={user.fullName} />}
          <span className="text-gray-700 dark:text-gray-300">
            Chào, {user?.fullName || user?.email}
          </span>

          <Link to="/settings/profile">
            <Button variant="outline">Cài đặt</Button>
          </Link>
          <Button onClick={logout} variant="destructive">
            Đăng xuất
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
