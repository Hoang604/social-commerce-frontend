// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import type { JSX } from "react";

// --- Core Components & Pages ---
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import Verify2faPage from "./pages/auth/Verify2faPage";
import { Toaster } from "./components/ui/Toaster";
import { SettingsLayout } from "./pages/settings/SettingsLayout";
import { ProfilePage } from "./pages/settings/ProfilePage";
import { SecurityPage } from "./pages/settings/SecurityPage";
import { ProjectSettingsPage } from "./pages/settings/ProjectSettingsPage";
import { useAuthStore } from "./stores/authStore";

// --- The New Inbox Structure ---
import { InboxLayout } from "./pages/inbox/InboxLayout";
import { MainLayout } from "./components/layout/MainLayout";
import { InboxRedirector } from "./pages/inbox/InboxRedirector";
import { MessagePane } from "./components/features/inbox/MessagePane";

/**
 * PublicRoute HOC for better auth flow.
 * Automatically redirects authenticated users from public pages.
 */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // UPDATED: Redirect to /inbox, not /dashboard
  return isAuthenticated ? <Navigate to="/inbox" replace /> : children;
};

function App() {
  return (
    <>
      <Routes>
        {/* === Public Routes with Guard === */}
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

        {/* === Protected Routes === */}

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Inbox Area is now a child of MainLayout */}
          <Route path="/inbox">
            {/* Route gốc /inbox sẽ do InboxRedirector xử lý */}
            <Route index element={<InboxRedirector />} />
            {/* Route cho project cụ thể sẽ hiển thị InboxLayout */}
            <Route path="projects/:projectId" element={<InboxLayout />}>
              {/* Khi có conversationId, MessagePane sẽ được render bên trong Outlet của InboxLayout */}
              <Route
                path="conversations/:conversationId"
                element={<MessagePane />}
              />
            </Route>
          </Route>

          {/* Settings Area is now a child of MainLayout */}
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="projects" element={<ProjectSettingsPage />} />
          </Route>
        </Route>
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/inbox" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
