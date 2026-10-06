"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { courseApi, type Course } from "@/src/services/course";
import { enrollmentApi, type Enrollment } from "@/src/services/enrollment";
import { studentApi, type Student } from "@/src/services/student";
import {
  attendanceApi,
  type Attendance,
  type AttendanceCreate,
} from "@/src/services/attendance";
import {
  scoreReportApi,
  type ScoreReport,
  type ScoreReportCreate,
} from "@/src/services/score-report";
import { useAuthStore } from "@/src/store/auth.store";
import { teacherApi, type Teacher } from "@/src/services/teacher";

type ReportTab = "students" | "scores" | "attendance";
type EnrolledStudent = { student: Student; enrollment: Enrollment };
type ScoreDraft = {
  assignment_score: string;
  midterm_score: string;
  final_score: string;
  total_score: string;
  grade: string;
  remark: string;
};
type AttendanceDraft = Pick<AttendanceCreate, "status" | "note">;

function localDateString(date = new Date()) {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 10);
}

const emptyScoreDraft: ScoreDraft = {
  assignment_score: "0",
  midterm_score: "0",
  final_score: "0",
  total_score: "0",
  grade: "F",
  remark: "",
};

function calculateTotalScore(assignment: string, midterm: string, finalExam: string) {
  if ([assignment, midterm, finalExam].some((value) => value.trim() === "")) return "";
  const total = Number(assignment) + Number(midterm) + Number(finalExam);
  return String(Math.round((total + Number.EPSILON) * 100) / 100);
}

function calculateGrade(total: string) {
  if (total.trim() === "") return "";
  const score = Number(total);
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function scoreLimit(field: "assignment_score" | "midterm_score" | "final_score") {
  return field === "assignment_score" ? 20 : 40;
}

export default function CourseReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading course reports...</div>}>
      <CourseReportsContent />
    </Suspense>
  );
}

function CourseReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [linkedTeacherId, setLinkedTeacherId] = useState<number | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [scoreReports, setScoreReports] = useState<ScoreReport[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [tab, setTab] = useState<ReportTab>("students");
  const [search, setSearch] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(localDateString());
  const [scoreDrafts, setScoreDrafts] = useState<Record<number, ScoreDraft>>(
    {},
  );
  const [attendanceDrafts, setAttendanceDrafts] = useState<
    Record<number, AttendanceDraft>
  >({});
  const [savingScoreId, setSavingScoreId] = useState<number | null>(null);
  const [savingAttendanceId, setSavingAttendanceId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [courseList, enrollmentList, studentList, teacherList] = await Promise.all([
          courseApi.list(),
          enrollmentApi.list(),
          studentApi.list(),
          teacherApi.list(),
        ]);
        if (!ignore) {
          setCourses(courseList);
          setTeachers(teacherList);
          setEnrollments(enrollmentList);
          setStudents(studentList);
          const linkedTeacher = teacherList.find((teacher) => teacher.user_id === user?.id);
          setLinkedTeacherId(linkedTeacher?.id ?? null);
        }
        const [scoreResult, attendanceResult] = await Promise.allSettled([
          scoreReportApi.list(),
          attendanceApi.list(),
        ]);
        if (!ignore) {
          if (scoreResult.status === "fulfilled")
            setScoreReports(scoreResult.value);
          if (attendanceResult.status === "fulfilled")
            setAttendanceRecords(attendanceResult.value);
        }
      } catch (cause) {
        if (!ignore)
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load course reports.",
          );
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!courseIdParam) return;
    const courseId = Number(courseIdParam);
    if (Number.isInteger(courseId) && courses.some((course) => course.id === courseId)) {
      setSelectedCourseId(courseId);
    }
  }, [courseIdParam, courses]);

  const selectedCourse =
    courses.find((course) => course.id === selectedCourseId) ?? null;
  const teacherNameForCourse = (course: Course) =>
    teachers.find((teacher) => teacher.id === course.teacher_id)?.name ?? `Teacher #${course.teacher_id}`;
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter((course) => {
      if (
        user?.role.toLowerCase() === "teacher" &&
        (!linkedTeacherId || course.teacher_id !== linkedTeacherId)
      )
        return false;
      return (
        !query ||
        course.name.toLowerCase().includes(query) ||
        (course.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [courses, search, user, linkedTeacherId]);
  const courseEnrollments = selectedCourse
    ? enrollments.filter((item) => item.course_id === selectedCourse.id)
    : [];
  const courseScores = selectedCourse
    ? scoreReports.filter((item) => item.course_id === selectedCourse.id)
    : [];
  const courseAttendance = selectedCourse
    ? attendanceRecords.filter((item) => item.course_id === selectedCourse.id)
    : [];
  const todayAttendance = courseAttendance.filter(
    (item) => item.date.slice(0, 10) === attendanceDate,
  );
  const enrolledStudents: EnrolledStudent[] = courseEnrollments.flatMap(
    (item) => {
      const student = students.find((entry) => entry.id === item.student_id);
      return student ? [{ student, enrollment: item }] : [];
    },
  );
  const activeCount = courseEnrollments.filter(
    (item) => item.status === "active",
  ).length;
  const completedCount = courseEnrollments.filter(
    (item) => item.status === "completed",
  ).length;

  function scoreDraftFor(studentId: number, record?: ScoreReport): ScoreDraft {
    return (
      scoreDrafts[studentId] ?? {
        assignment_score: record
          ? String(record.assignment_score)
          : emptyScoreDraft.assignment_score,
        midterm_score: record
          ? String(record.midterm_score)
          : emptyScoreDraft.midterm_score,
        final_score: record
          ? String(record.final_score)
          : emptyScoreDraft.final_score,
        total_score: record
          ? calculateTotalScore(
              String(record.assignment_score),
              String(record.midterm_score),
              String(record.final_score),
            )
          : emptyScoreDraft.total_score,
        grade: calculateGrade(
          calculateTotalScore(
            record ? String(record.assignment_score) : "",
            record ? String(record.midterm_score) : "",
            record ? String(record.final_score) : "",
          ),
        ),
        remark: record?.remark ?? emptyScoreDraft.remark,
      }
    );
  }

  function attendanceDraftFor(
    studentId: number,
    record?: Attendance,
  ): AttendanceDraft {
    return (
      attendanceDrafts[studentId] ?? {
        status: record?.status ?? "",
        note: record?.note ?? "",
      }
    );
  }

  async function saveScore(student: Student) {
    if (!selectedCourse) return;
    const existing = courseScores.find(
      (record) => record.student_id === student.id,
    );
    const draft = scoreDraftFor(student.id, existing);
    const totalScore = calculateTotalScore(
      draft.assignment_score,
      draft.midterm_score,
      draft.final_score,
    );
    const grade = calculateGrade(totalScore);
    const hasInvalidScore = (
      [
        [draft.assignment_score, 20],
        [draft.midterm_score, 40],
        [draft.final_score, 40],
      ] as const
    ).some(([value, max]) => value.trim() === "" || Number(value) < 0 || Number(value) > max);
    if (
      hasInvalidScore || !grade
    ) {
      setRecordError("Enter valid scores: assignment 0–20, midterm 0–40, and final 0–40.");
      return;
    }
    setSavingScoreId(student.id);
    setRecordError(null);
    try {
      const payload: ScoreReportCreate = {
        ...draft,
        student_id: student.id,
        course_id: selectedCourse.id,
        assignment_score: Number(draft.assignment_score),
        midterm_score: Number(draft.midterm_score),
        final_score: Number(draft.final_score),
        total_score: Number(totalScore),
        grade,
        remark: draft.remark?.trim() || null,
      };
      const saved = existing
        ? await scoreReportApi.update(existing.id, payload)
        : await scoreReportApi.create(payload);
      setScoreReports((current) =>
        existing
          ? current.map((record) =>
              record.id === existing.id ? saved : record,
            )
          : [saved, ...current],
      );
      setScoreDrafts((current) => {
        const next = { ...current };
        delete next[student.id];
        return next;
      });
    } catch (cause) {
      setRecordError(
        cause instanceof Error ? cause.message : "Could not save score report.",
      );
    } finally {
      setSavingScoreId(null);
    }
  }

  async function saveAttendance(student: Student) {
    if (!selectedCourse) return;
    const existing = todayAttendance.find(
      (record) => record.student_id === student.id,
    );
    const draft = attendanceDraftFor(student.id, existing);
    if (!draft.status) {
      setRecordError("Select an attendance status before saving.");
      return;
    }
    setSavingAttendanceId(student.id);
    setRecordError(null);
    try {
      const payload: AttendanceCreate = {
        ...draft,
        student_id: student.id,
        course_id: selectedCourse.id,
        date: attendanceDate,
        note: draft.note?.trim() || null,
      };
      const saved = existing
        ? await attendanceApi.update(existing.id, payload)
        : await attendanceApi.create(payload);
      setAttendanceRecords((current) =>
        existing
          ? current.map((record) =>
              record.id === existing.id ? saved : record,
            )
          : [saved, ...current],
      );
      setAttendanceDrafts((current) => {
        const next = { ...current };
        delete next[student.id];
        return next;
      });
    } catch (cause) {
      setRecordError(
        cause instanceof Error
          ? cause.message
          : "Could not save attendance record.",
      );
    } finally {
      setSavingAttendanceId(null);
    }
  }

  async function deleteScore(record: ScoreReport) {
    if (!window.confirm("Delete this score report?")) return;
    setRecordError(null);
    try {
      await scoreReportApi.delete(record.id);
      setScoreReports((current) =>
        current.filter((item) => item.id !== record.id),
      );
      setScoreDrafts((current) => {
        const next = { ...current };
        delete next[record.student_id];
        return next;
      });
    } catch (cause) {
      setRecordError(
        cause instanceof Error
          ? cause.message
          : "Could not delete score report.",
      );
    }
  }

  async function deleteAttendance(record: Attendance) {
    if (!window.confirm("Delete this attendance record?")) return;
    setRecordError(null);
    try {
      await attendanceApi.delete(record.id);
      setAttendanceRecords((current) =>
        current.filter((item) => item.id !== record.id),
      );
      setAttendanceDrafts((current) => {
        const next = { ...current };
        delete next[record.student_id];
        return next;
      });
    } catch (cause) {
      setRecordError(
        cause instanceof Error
          ? cause.message
          : "Could not delete attendance record.",
      );
    }
  }

  const inputClass =
    "w-full min-w-20 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <section className="space-y-6 text-slate-900">
      {selectedCourse ? (
        <>
          <button
            type="button"
            onClick={() => {
              setSelectedCourseId(null);
              setTab("students");
              router.replace("/course-reports");
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} /> All courses
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">Course report</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                {selectedCourse.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {selectedCourse.description || "No course description"} ·
                Teacher: {teacherNameForCourse(selectedCourse)} ·
                Classroom: {selectedCourse.classroom || "—"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${selectedCourse.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
            >
              {selectedCourse.status}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Enrolled students"
              value={courseEnrollments.length}
              icon={<Users size={18} />}
            />
            <SummaryCard
              label="Active"
              value={activeCount}
              icon={<ClipboardCheck size={18} />}
            />
            <SummaryCard
              label="Completed"
              value={completedCount}
              icon={<BookOpen size={18} />}
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-3 pt-3 sm:px-4">
              {(["students", "scores", "attendance"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setTab(item);
                    setRecordError(null);
                  }}
                  className={`shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium capitalize sm:px-4 ${tab === item ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500 hover:text-gray-800"}`}
                >
                  {item === "students"
                    ? "Students"
                    : item === "scores"
                      ? "Score reports"
                      : "Attendance"}
                </button>
              ))}
            </div>
            {recordError && (
              <p
                role="alert"
                className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {recordError}
              </p>
            )}
            {tab === "students" &&
              (enrolledStudents.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Users size={28} className="mx-auto mb-3 text-gray-400" />
                  <p className="font-medium text-gray-800">
                    No students enrolled
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Students enrolled in this course will appear here.
                  </p>
                </div>
              ) : (
                <div className="table-scroll">
                  <p className="px-4 py-2 text-xs text-gray-500 md:hidden">Swipe horizontally to see all columns.</p>
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-5 py-3">Student</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Phone</th>
                        <th className="px-5 py-3">Classroom</th>
                        <th className="px-5 py-3">Enrolled</th>
                        <th className="px-5 py-3">Enrollment status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {enrolledStudents.map(({ student, enrollment }) => (
                        <tr key={enrollment.id} className="text-gray-700">
                          <td className="px-5 py-4">
                            <span className="font-medium text-gray-900">
                              {student.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">
                              #{student.id}
                            </span>
                          </td>
                          <td className="px-5 py-4">{student.email}</td>
                          <td className="px-5 py-4">{student.phone}</td>
                          <td className="px-5 py-4">{courses.find((course) => course.id === enrollment.course_id)?.classroom || "—"}</td>
                          <td className="px-5 py-4">{enrollment.start_date}</td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
                              {enrollment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            {tab === "scores" && (
              <div className="p-4 sm:p-5">
                <div className="mb-4">
                  <h2 className="font-semibold text-gray-900">
                    Student scores
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enter weighted points: assignment /20, midterm /40, final /40. Total and A–F grade are calculated automatically.
                  </p>
                </div>
                {enrolledStudents.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-500">
                    Enroll students in this course to add scores.
                  </p>
                ) : (
                  <div className="table-scroll">
                    <p className="px-3 py-2 text-xs text-gray-500 md:hidden">Swipe horizontally to see all columns.</p>
                    <table className="w-full min-w-[1100px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-3 py-3">Student</th>
                          <th className="px-3 py-3">Assignment /20</th>
                          <th className="px-3 py-3">Midterm /40</th>
                          <th className="px-3 py-3">Final /40</th>
                          <th className="px-3 py-3">Total</th>
                          <th className="px-3 py-3">Grade</th>
                          <th className="px-3 py-3">Remark</th>
                          <th className="px-3 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {enrolledStudents.map(({ student }) => {
                          const record = courseScores.find(
                            (item) => item.student_id === student.id,
                          );
                          const draft = scoreDraftFor(student.id, record);
                          return (
                            <tr key={student.id} className="text-gray-700">
                              <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-900">
                                {student.name}
                              </td>
                              {(
                                [
                                  "assignment_score",
                                  "midterm_score",
                                  "final_score",
                                ] as const
                              ).map((field) => (
                                <td key={field} className="px-2 py-2">
                                  <input
                                    aria-label={`${student.name} ${field.replaceAll("_", " ")}`}
                                    required
                                    type="number"
                                    min="0"
                                    max={scoreLimit(field)}
                                    step="0.01"
                                    value={draft[field]}
                                    onChange={(event) =>
                                      setScoreDrafts((current) => {
                                        const next = { ...draft, [field]: event.target.value };
                                        next.total_score = calculateTotalScore(
                                          next.assignment_score,
                                          next.midterm_score,
                                          next.final_score,
                                        );
                                        next.grade = calculateGrade(next.total_score);
                                        return { ...current, [student.id]: next };
                                      })
                                    }
                                    className={`${inputClass} ${draft[field] !== "" && Number(draft[field]) > scoreLimit(field) ? "border-red-500" : ""}`}
                                  />
                                  {draft[field] !== "" && Number(draft[field]) > scoreLimit(field) && (
                                    <p role="alert" className="mt-1 min-w-32 text-xs text-red-600">
                                      Cannot exceed {scoreLimit(field)} points ({scoreLimit(field)}%).
                                    </p>
                                  )}
                                </td>
                              ))}
                              <td className="px-2 py-2">
                                <input
                                  aria-label={`${student.name} calculated total score`}
                                  readOnly
                                  value={calculateTotalScore(draft.assignment_score, draft.midterm_score, draft.final_score)}
                                  className={`${inputClass} bg-gray-100`}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  aria-label={`${student.name} grade`}
                                  readOnly
                                  value={draft.grade}
                                  placeholder="Auto grade"
                                  className={`${inputClass} bg-gray-100`}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  aria-label={`${student.name} remark`}
                                  value={draft.remark ?? ""}
                                  onChange={(event) =>
                                    setScoreDrafts((current) => ({
                                      ...current,
                                      [student.id]: {
                                        ...draft,
                                        remark: event.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Remark"
                                  className={inputClass}
                                />
                              </td>
                              <td className="whitespace-nowrap px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={
                                      savingScoreId === student.id ||
                                      ([
                                        [draft.assignment_score, 20],
                                        [draft.midterm_score, 40],
                                        [draft.final_score, 40],
                                      ] as const).some(([value, max]) => value.trim() === "" || Number(value) < 0 || Number(value) > max)
                                    }
                                    onClick={() => void saveScore(student)}
                                    className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {savingScoreId === student.id
                                      ? "Saving..."
                                      : record
                                        ? "Update"
                                        : "Save"}
                                  </button>
                                  {record && (
                                    <button
                                      type="button"
                                      onClick={() => void deleteScore(record)}
                                      aria-label={`Delete ${student.name} score`}
                                      className="rounded p-2 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {tab === "attendance" && (
              <div className="p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Daily attendance
                    </h2>
                    <p className="text-sm text-gray-500">
                      Choose a date and enter each student’s attendance in the
                      table.
                    </p>
                  </div>
                  <label className="text-xs font-medium text-gray-700">
                    Attendance date
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(event) => {
                        setAttendanceDate(event.target.value);
                        setAttendanceDrafts({});
                      }}
                      className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                {enrolledStudents.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-500">
                    Enroll students in this course to track attendance.
                  </p>
                ) : (
                  <div className="table-scroll">
                    <p className="px-4 py-2 text-xs text-gray-500 md:hidden">Swipe horizontally to see all columns.</p>
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Note</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {enrolledStudents.map(({ student }) => {
                          const record = todayAttendance.find(
                            (item) => item.student_id === student.id,
                          );
                          const draft = attendanceDraftFor(student.id, record);
                          return (
                            <tr key={student.id} className="text-gray-700">
                              <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                                {student.name}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {attendanceDate}
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  required
                                  aria-label={`${student.name} attendance status`}
                                  value={draft.status}
                                  onChange={(event) =>
                                    setAttendanceDrafts((current) => ({
                                      ...current,
                                      [student.id]: {
                                        ...draft,
                                        status: event.target.value,
                                      },
                                    }))
                                  }
                                  className={inputClass}
                                >
                                  <option value="" disabled>
                                    Select status
                                  </option>
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                  <option value="late">Late</option>
                                  <option value="excused">Excused</option>
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  aria-label={`${student.name} attendance note`}
                                  value={draft.note ?? ""}
                                  onChange={(event) =>
                                    setAttendanceDrafts((current) => ({
                                      ...current,
                                      [student.id]: {
                                        ...draft,
                                        note: event.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Optional note"
                                  className={inputClass}
                                />
                              </td>
                              <td className="whitespace-nowrap px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={
                                      savingAttendanceId === student.id ||
                                      !draft.status
                                    }
                                    onClick={() => void saveAttendance(student)}
                                    className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {savingAttendanceId === student.id
                                      ? "Saving..."
                                      : record
                                        ? "Update"
                                        : "Save"}
                                  </button>
                                  {record && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void deleteAttendance(record)
                                      }
                                      aria-label={`Delete ${student.name} attendance`}
                                      className="rounded p-2 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Reports</h1>
            <p className="mt-1 text-sm text-gray-600">
              Choose a course to view its students, enrollment summary, and
              attendance report.
            </p>
          </div>
          <label className="relative block max-w-xl">
            <span className="sr-only">Search courses</span>
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          {user?.role.toLowerCase() === "teacher" && !linkedTeacherId && !loading && (
            <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              This account is not linked to a teacher record yet. Ask an administrator to link the account before viewing assigned courses.
            </div>
          )}
          {loading ? (
            <p className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center text-sm text-gray-500">
              Loading courses...
            </p>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
              <BookOpen size={28} className="mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-gray-800">No courses found</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const courseItems = enrollments.filter(
                  (item) => item.course_id === course.id,
                );
                const active = courseItems.filter(
                  (item) => item.status === "active",
                ).length;
                return (
                  <article
                    key={course.id}
                    className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <BookOpen size={21} />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${course.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {course.status}
                      </span>
                    </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  {course.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-blue-700">
                  Teacher: {teacherNameForCourse(course)} · Classroom: {course.classroom || "—"}
                </p>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm text-gray-500">
                      {course.description || "No description provided."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={15} />
                        {courseItems.length}{" "}
                        {courseItems.length === 1 ? "student" : "students"}
                      </span>
                      <span>{active} active</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                      <span>
                        {course.start_date}
                        {course.end_date
                          ? ` – ${course.end_date}`
                          : " · Ongoing"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCourseId(course.id)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        View report
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="rounded-lg bg-blue-50 p-3 text-blue-700">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
