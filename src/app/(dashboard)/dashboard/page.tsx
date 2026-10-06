"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/src/store/auth.store";
import { studentApi, type Student } from "@/src/services/student";
import { courseApi, type Course } from "@/src/services/course";
import { enrollmentApi, type Enrollment } from "@/src/services/enrollment";
import { Users, BookOpen, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const name = user?.username ?? "there";

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [sList, cList, eList] = await Promise.all([
          studentApi.list().catch(() => []),
          courseApi.list().catch(() => []),
          enrollmentApi.list().catch(() => []),
        ]);
        setStudents(sList);
        setCourses(cList);
        setEnrollments(eList);
      } finally {
        setLoading(false);
      }
    }
    void fetchStats();
  }, []);

  const activeEnrollments = enrollments.filter((e) => e.status === "active").length;
  const completedEnrollments = enrollments.filter((e) => e.status === "completed").length;
  const activeCourses = courses.filter((c) => c.status).length;

  const stats = [
    {
      label: "Total Students",
      value: loading ? "..." : String(students.length),
      sub: "Active enrolled learners",
      icon: <Users className="text-blue-600" size={24} />,
    },
    {
      label: "Total Courses",
      value: loading ? "..." : String(courses.length),
      sub: `${activeCourses} active courses`,
      icon: <BookOpen className="text-emerald-600" size={24} />,
    },
    {
      label: "Active Enrollments",
      value: loading ? "..." : String(activeEnrollments),
      sub: `${completedEnrollments} completed`,
      icon: <GraduationCap className="text-purple-600" size={24} />,
    },
    {
      label: "Total Classes",
      value: loading ? "..." : String(enrollments.length),
      sub: "Overall admissions",
      icon: <CheckCircle2 className="text-teal-600" size={24} />,
    },
  ];

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of student admissions, courses, and active classroom enrollments.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/students"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Manage Students
          </Link>
          <Link
            href="/enrollments"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Enrollments
          </Link>
        </div>
      </header>

      {/* Key Numbers */}
      <section
        aria-label="Key statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{s.label}</span>
              <div className="rounded-lg bg-gray-50 p-2">{s.icon}</div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900 tabular-nums">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* Recent Activity & Shortcuts */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Students */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="font-semibold text-gray-900">Recent Students</h2>
            <Link
              href="/students"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {students.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No students found.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {students.slice(0, 5).map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700 font-medium">
                      {student.major || "General"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Shortcuts / Quick Actions */}
        <section className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Navigation</h2>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/students"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 transition"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-blue-600" />
                  <span>Student Directory</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>

              <Link
                href="/courses"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-600 transition"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-emerald-600" />
                  <span>Course Catalog</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>

              <Link
                href="/enrollments"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 hover:border-purple-500 hover:bg-purple-50/50 hover:text-purple-600 transition"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap size={18} className="text-purple-600" />
                  <span>Class Enrollments</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
