"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, RefreshCw, Users } from "lucide-react";
import { courseApi, type Course } from "@/src/services/course";
import { enrollmentApi, type Enrollment } from "@/src/services/enrollment";
import { teacherApi } from "@/src/services/teacher";
import { useAuthStore } from "@/src/store/auth.store";

const classroomNumbers = Array.from({ length: 10 }, (_, index) => 101 + index);

function classroomNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const match = String(value).trim().match(/(?:^|\D)(10[1-9]|110)(?:\D|$)/);
  return match ? Number(match[1]) : null;
}

export default function ClassMonitorPage() {
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teacherCourseIds, setTeacherCourseIds] = useState<number[] | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseList, enrollmentList] = await Promise.all([
        courseApi.list(),
        enrollmentApi.list(),
      ]);
      setCourses(courseList);
      setEnrollments(enrollmentList);
      if (user?.role.toLowerCase() === "teacher") {
        const teachers = await teacherApi.list();
        const linkedTeacher = teachers.find((teacher) => teacher.user_id === user.id);
        setTeacherCourseIds(linkedTeacher
          ? courseList.filter((course) => course.teacher_id === linkedTeacher.id).map((course) => course.id)
          : []);
      } else {
        setTeacherCourseIds(null);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load classroom data.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => { void loadData(); }, [loadData]);

  const roomUsage = classroomNumbers.map((number) => {
    const assignedCourses = courses.filter((course) => classroomNumber(course.classroom) === number);
    const occupiedCourses = assignedCourses
      .filter((course) => teacherCourseIds === null || teacherCourseIds.includes(course.id))
      .map((course) => ({
        course,
        enrollments: enrollments.filter((enrollment) => enrollment.course_id === course.id),
      }));
    return { number, assignedCourses, occupiedCourses };
  });
  const busyCount = roomUsage.filter((room) => room.assignedCourses.length > 0).length;

  return (
    <section className="space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Monitor</h1>
          <p className="mt-1 text-sm text-gray-600">Room availability and enrolled student totals for classes 101–110.</p>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void loadData()} className="font-semibold underline">Try again</button></div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Busy rooms</p><p className="mt-1 text-3xl font-bold text-red-700">{busyCount}<span className="ml-2 text-base font-medium text-gray-400">/ 10</span></p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Available rooms</p><p className="mt-1 text-3xl font-bold text-emerald-700">{10 - busyCount}<span className="ml-2 text-base font-medium text-gray-400">/ 10</span></p></div>
      </div>

      {loading ? <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">Loading classroom availability...</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{roomUsage.map(({ number, assignedCourses, occupiedCourses }) => {
        const busy = assignedCourses.length > 0;
        return <article key={number} className={`rounded-xl border bg-white p-5 shadow-sm ${busy ? "border-red-200" : "border-emerald-200"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-lg ${busy ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}><Building2 size={21} /></div><div><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Classroom</p><h2 className="text-xl font-bold text-gray-900">{number}</h2></div></div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${busy ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{busy ? "Busy" : "Available"}</span>
          </div>
          {busy ? occupiedCourses.length > 0 ? <div className="mt-4 space-y-3">{occupiedCourses.map(({ course, enrollments: courseEnrollments }) => <div key={course.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"><div className="flex items-center gap-1.5 text-sm font-medium text-gray-700"><Users size={16} />{courseEnrollments.length} {courseEnrollments.length === 1 ? "student" : "students"}</div><Link href={`/course-reports?courseId=${course.id}`} aria-label={`View ${course.name} course report`} className="shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">View course</Link></div>)}</div> : <p className="mt-4 rounded-lg bg-amber-50/70 px-3 py-3 text-sm text-amber-800">Busy · assigned course details are only visible to its teacher.</p> : <p className="mt-4 rounded-lg bg-emerald-50/70 px-3 py-3 text-sm text-emerald-800">No course assigned to this room.</p>}
        </article>;
      })}</div>}
      <p className="text-xs text-gray-500">A room is marked busy when any course is assigned to it. Student totals match the course enrollment reports.</p>
    </section>
  );
}
