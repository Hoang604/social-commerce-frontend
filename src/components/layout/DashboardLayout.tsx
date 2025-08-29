// src/components/layout/DashboardLayout.tsx
import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useUserProfileQuery } from "../../services/settingsApi";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ThemeToggleButton } from "../../components/ui/ThemeToggleButton";

export function DashboardLayout() {
  const logout = useAuthStore((state) => state.logout);
  const { data: user } = useUserProfileQuery();

  return (
    // Change the overall page background to a muted color
    <div className="flex flex-col h-screen bg-muted/40">
      {/* The header has a card background to stand out */}
      <header className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-xl font-bold text-foreground">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggleButton />
          {user && <Avatar src={user.avatarUrl} name={user.fullName} />}
          <span className="text-muted-foreground">
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
