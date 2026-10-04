"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  GraduationCap,
  PlusCircle,
  Trash2,
  Search,
  CheckCircle2,
  Copy,
  Layers,
  Code2,
  ArrowRight,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuthStore } from "@/src/store/auth.store";
import { studentService } from "@/src/services/student.service";
import { Navbar } from "@/src/components/Navbar";
import type { Student } from "@/src/types/auth";

export default function HomePage() {
  const { user, token } = useAuthStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    age: 20,
    phone: "0123456789",
    major: "Computer Science",
  });

  const loadStudents = useCallback(async (query = "") => {
    setLoadingStudents(true);
    try {
      const data = await studentService.list(query);
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      loadStudents();
    }
  }, [user, token, loadStudents]);

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentService.create(newStudent);
      setNewStudent({
        name: "",
        email: "",
        age: 20,
        phone: "0123456789",
        major: "Computer Science",
      });
      setShowAddForm(false);
      await loadStudents();
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to add student");
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await studentService.delete(id);
      await loadStudents(searchQuery);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to delete student");
    }
  };

  // Decode JWT payload for inspection
  const getDecodedPayload = () => {
    if (!token) return null;
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  };

  const decodedPayload = getDecodedPayload();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          /* ================= GUEST / WELCOME VIEW ================= */
          <div className="py-8 sm:py-16 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>Object-Oriented Programming &amp; Signed JWT Token Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Manage Students with{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Clean OOP &amp; Tokens
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                A decoupled full-stack platform featuring dedicated <code>/login</code> and <code>/register</code> routes,
                cryptographically signed JWT Bearer tokens, and class-based repository &amp; service abstractions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Go to Login Page</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create New Account</span>
                </Link>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="grid md:grid-cols-3 gap-6 pt-6">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white mb-2">JWT Token Generation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  FastAPI backend signs tokens with user ID, username, and role claims upon authentication. Supports <code>/api/v1/auth/me</code> Bearer validation.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white mb-2">OOP Design Patterns</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Adheres to SOLID principles: abstract base classes (<code className="text-indigo-300">ITokenService</code>, <code className="text-indigo-300">IAuthService</code>), dependency injection, and data encapsulation.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <Code2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white mb-2">Next.js App Router Structure</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clean modular structure with dedicated <code>src/app/login/page.tsx</code> and <code>src/app/register/page.tsx</code> routes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ================= AUTHENTICATED DASHBOARD ================= */
          <div className="space-y-8">
            {/* User Welcome Banner */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 p-6 backdrop-blur">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/30">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white capitalize">{user.username}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                        {user.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        AUTHENTICATED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      User ID: <code className="text-indigo-300 font-mono">#{user.id}</code> | Authorized with Bearer JWT Token
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadStudents(searchQuery)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{showAddForm ? "Close Form" : "Add Student"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Token Inspector */}
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <KeyRound className="h-4 w-4" />
                    <span>Generated JWT Access Token</span>
                  </div>
                  <button
                    onClick={handleCopyToken}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700 font-mono"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedToken ? "Copied!" : "Copy Token"}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-emerald-400 break-all select-all leading-relaxed">
                  {token}
                </div>

                {decodedPayload && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                      Decoded Payload Claims
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono text-xs">
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Subject (sub)</span>
                        <span className="text-white font-semibold">{decodedPayload.sub}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Username</span>
                        <span className="text-white font-semibold">{decodedPayload.username}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Role</span>
                        <span className="text-indigo-400 font-semibold capitalize">{decodedPayload.role}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Expires At</span>
                        <span className="text-amber-400 font-semibold">
                          {new Date(decodedPayload.exp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* OOP Features Summary */}
              <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm mb-3">
                    <Code2 className="h-4 w-4" />
                    <span>OOP Backend Highlights</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span><code>ITokenService</code> &amp; <code>JWTTokenService</code></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span><code>IPasswordHasher</code> &amp; <code>BcryptPasswordHasher</code></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span><code>IAuthService</code> &amp; <code>AuthService</code></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Dependency injection via constructor</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Separated pages for <code>/login</code> and <code>/register</code>.
                </div>
              </div>
            </div>

            {/* Add Student Form */}
            {showAddForm && (
              <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-6 backdrop-blur">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-indigo-400" />
                  <span>Register New Student</span>
                </h3>
                <form onSubmit={handleAddStudent} className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={100}
                      value={newStudent.age}
                      onChange={(e) => setNewStudent({ ...newStudent, age: parseInt(e.target.value) || 18 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                      placeholder="0123456789"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Major</label>
                    <input
                      type="text"
                      value={newStudent.major}
                      onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })}
                      placeholder="Computer Science"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-5 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                    >
                      Save Student
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Students List Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-400" />
                    <span>Registered Students</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live records managed via OOP StudentService repository
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      loadStudents(e.target.value);
                    }}
                    placeholder="Search by name or email..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {loadingStudents ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="inline-block h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
                  <p>Loading students from API...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No students found matching your query.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Age</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Major</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono text-slate-400">#{student.id}</td>
                          <td className="py-3 px-4 font-semibold text-white">{student.name}</td>
                          <td className="py-3 px-4 text-slate-300 font-mono">{student.email}</td>
                          <td className="py-3 px-4 text-slate-300">{student.age} yrs</td>
                          <td className="py-3 px-4 text-slate-400 font-mono">{student.phone}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
                              {student.major || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete Student"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
