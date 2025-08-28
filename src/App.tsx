// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import type { JSX } from "react";

// --- Components & Pages ---
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { SocketProvider } from "./contexts/SocketContext";
import RegisterPage from "./pages/auth/RegisterPage";
import Verify2faPage from "./pages/auth/Verify2faPage";

// --- New Imports ---
import { SettingsLayout } from "./pages/settings/SettingsLayout";
import { ProfilePage } from "./pages/settings/ProfilePage";
import { SecurityPage } from "./pages/settings/SecurityPage";
import { ConnectionsPage } from "./pages/settings/ConnectionsPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { FacebookCallbackPage } from "./pages/FacebookCallbackPage";
import MessagePaneRoute from "./components/features/inbox/MessagePaneRoute";
import { SocialCallbackPage } from "./pages/auth/SocialCallbackPage";

/**
 * Bọc các route công khai. Tự động chuyển hướng nếu đã đăng nhập.
 */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Routes>
      {/* === Public Routes === */}
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
      <Route path="/verify-2fa" element={<Verify2faPage />} />
      <Route
        path="/auth/social-callback"
        element={<SocialCallbackPage />}
      />{" "}
      {/* <-- ROUTE MỚI */}
      {/* === Protected Routes === */}
      {/* Dashboard Area */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <SocketProvider>
              {/* Sử dụng DashboardLayout cho toàn bộ khu vực dashboard */}
              <Routes>
                {/* Route mặc định cho /dashboard sẽ render DashboardPage */}
                <Route path="/" element={<DashboardLayout />}>
                  {/* Các route con của DashboardPage */}
                  <Route index element={<DashboardPage />} />
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
                    element={<MessagePaneRoute />}
                  />
                </Route>
              </Routes>
            </SocketProvider>
          </ProtectedRoute>
        }
      />
      {/* Settings Area */}
      <Route
        path="/settings/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<SettingsLayout />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="connections" element={<ConnectionsPage />} />
                <Route index element={<Navigate to="profile" replace />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        }
      />
      {/* Facebook Callback Route */}
      <Route
        path="/facebook/callback"
        element={
          <ProtectedRoute>
            <FacebookCallbackPage />
          </ProtectedRoute>
        }
      />
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
