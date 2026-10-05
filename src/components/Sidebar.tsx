"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/auth.store";
import { Home, User, LogOut } from "lucide-react";
import { authService } from "../services/auth.service";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      name: "Student",
      href: "/students",
      icon: <User size={20} />,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-gray-900 text-white shadow-xl">
      {/* Header */}
      <div className="border-b border-gray-700 px-6 py-5">
        <h2 className="text-xl font-bold">HR System</h2>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 border-b border-gray-700 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="min-w-0">
          <strong className="block truncate text-sm">
            {user?.username || "User"}
          </strong>

          <small className="text-xs text-gray-400">
            {user?.role || "Employee"}
          </small>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500 hover:text-white"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
