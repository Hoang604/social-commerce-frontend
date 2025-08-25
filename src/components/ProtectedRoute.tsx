import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Chuyển hướng người dùng về trang đăng nhập
    return <Navigate to="/login" replace />;
  }

  // Nếu có children thì render children, không thì render Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
