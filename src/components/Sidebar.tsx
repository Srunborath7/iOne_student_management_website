"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth.store";
import { BookOpen, Building2, ClipboardCheck, GraduationCap, Home, LogOut, Menu, UserGroup, Users, X } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: <Home size={20} /> },
  { name: "Students", href: "/students", icon: <Users size={20} /> },
  { name: "Courses", href: "/courses", icon: <BookOpen size={20} /> },
  { name: "Course Reports", href: "/course-reports", icon: <ClipboardCheck size={20} /> },
  { name: "Class Monitor", href: "/class-monitor", icon: <Building2 size={20} /> },
  { name: "Enrollments", href: "/enrollments", icon: <GraduationCap size={20} /> },
  { name: "Teachers", href: "/teachers", icon: <UserGroup size={20} /> },
  { name: "Users", href: "/users", icon: <Users size={20} /> },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleMenuItems = user?.role.toLowerCase() === "teacher"
    ? menuItems.filter((item) => ["/dashboard", "/course-reports", "/class-monitor", "/teachers"].includes(item.href))
    : user ? menuItems : [];

  function handleLogout() {
    logout();
    setMobileOpen(false);
    router.replace("/login");
  }

  function navLink(item: (typeof menuItems)[number], mobile = false) {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => mobile && setMobileOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${active ? "bg-blue-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
      >
        {item.icon}<span>{item.name}</span>
      </Link>
    );
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-700 bg-gray-900 px-4 text-white md:hidden">
        <Link href="/dashboard" className="truncate text-base font-bold">Student Portal</Link>
        <div className="flex items-center gap-2">
          <span className="max-w-28 truncate text-xs text-gray-300">{user?.username || "Admin"}</span>
          <button type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="rounded-lg p-2 hover:bg-gray-800">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      {mobileOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/40 md:hidden" />}
      <nav aria-label="Mobile navigation" className={`fixed inset-x-0 top-14 z-40 max-h-[calc(100dvh-3.5rem)] space-y-1 overflow-y-auto border-b border-gray-700 bg-gray-900 px-3 py-3 shadow-xl transition-transform md:hidden ${mobileOpen ? "translate-y-0" : "-translate-y-[150%] pointer-events-none"}`}>
        {visibleMenuItems.map((item) => navLink(item, true))}
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-300 hover:bg-red-500/20"><LogOut size={20} /> Logout</button>
      </nav>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-gray-900 text-white shadow-xl md:flex">
        <div className="border-b border-gray-700 px-6 py-5"><h2 className="text-xl font-bold tracking-tight">Student Portal</h2><p className="text-xs text-gray-400">Management System</p></div>
        <div className="flex items-center gap-3 border-b border-gray-700 px-5 py-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold shadow">{user?.username?.charAt(0).toUpperCase() || "U"}</div><div className="min-w-0"><strong className="block truncate text-sm">{user?.username || "Admin"}</strong><small className="text-xs capitalize text-gray-400">{user?.role || "Administrator"}</small></div></div>
        <nav aria-label="Main navigation" className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">{visibleMenuItems.map((item) => navLink(item))}</nav>
        <div className="border-t border-gray-700 p-4"><button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300"><LogOut size={20} /><span>Logout</span></button></div>
      </aside>
    </>
  );
}
