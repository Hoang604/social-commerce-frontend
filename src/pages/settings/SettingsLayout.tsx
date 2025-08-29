// src/pages/settings/SettingsLayout.tsx
import { NavLink, Outlet, Link } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  { name: "Profile", href: "/settings/profile" },
  { name: "Security", href: "/settings/security" },
  { name: "Connections", href: "/settings/connections" },
];

export function SettingsLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col dark:bg-gray-900 dark:border-gray-700">
        <nav className="flex flex-col space-y-1 mb-6">
          <Link
            to="/dashboard"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:border-gray-600"
          >
            &larr; Quay lại Dashboard
          </Link>
        </nav>
        <h2 className="text-lg font-semibold mb-4 px-3 text-gray-900 dark:text-gray-100">
          Settings
        </h2>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" // Active state for dark mode
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800" // Inactive state for dark mode
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-white dark:bg-gray-950">
        <Outlet />
      </main>
    </div>
  );
}
