"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { GraduationCap, LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuthStore } from "@/src/store/auth.store";

export function Navbar() {
  const { user, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              iOne Student Management
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>We Support & Community</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white capitalize">{user.username}</p>
                <p className="text-xs text-indigo-400 uppercase tracking-wider font-mono">
                  {user.role}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white border border-indigo-400/30">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300 text-sm transition-all"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/30 transition"
              >
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
