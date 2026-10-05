"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, User as UserIcon, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/src/store/auth.store";
import { Navbar } from "@/src/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, error, successMessage, login, clearFeedback } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
    clearFeedback();
  }, [user, router, clearFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    const success = await login({ username, password });
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 mb-3 shadow-lg shadow-indigo-500/25">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Sign In</h1>
              <p className="text-xs text-slate-400 mt-1">
                Welcome Back With Student Management System
              </p>
            </div>

            {/* Error / Success Feedback */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Admin or your username"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            {/* Footer link to Register */}
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-400">
                Don&apos;t have an account yet?{" "}
                <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
