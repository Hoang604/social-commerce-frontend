import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import { useAuthStore } from "./stores/authStore";
import DashboardPage from "./pages/DashboardPage";
import MessagePane from "./components/features/inbox/MessagePane";
import { SocketProvider } from "./contexts/SocketContext";
import RegisterPage from "./pages/auth/RegisterPage";
import Verify2faPage from "./pages/auth/Verify2faPage";
import type { JSX } from "react";
/**
 * Component này dùng để bọc các route công khai (Login, Register).
 * Nếu người dùng đã đăng nhập, nó sẽ tự động chuyển hướng họ đến dashboard.
 */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="/verify-2fa" element={<Verify2faPage />} />{" "}
      {/* Không cần PublicRoute vì đây là một phần của luồng login */}
      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <Routes>
                <Route path="/" element={<DashboardPage />}>
                  <Route
                    path="page/:pageId"
                    element={
                      <div className="flex-1 flex items-center justify-center text-neutral-600">
                        <p>Select a conversation.</p>
                      </div>
                    }
                  />
                  <Route
                    path="page/:pageId/conversation/:conversationId"
                    element={<MessagePane />}
                  />
                </Route>
              </Routes>
            </SocketProvider>
          </ProtectedRoute>
        }
      />
      {/* Fallback route: nếu không khớp route nào, chuyển về login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
