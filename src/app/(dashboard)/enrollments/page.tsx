"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Search,
  RefreshCw,
  GraduationCap,
  Plus,
  X,
  Clock,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";
import {
  enrollmentApi,
  type Enrollment,
  type EnrollmentCreate,
  type EnrollmentStatus,
} from "@/src/services/enrollment";
import { studentApi, type Student } from "@/src/services/student";
import { courseApi, type Course } from "@/src/services/course";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    classroom: string;
    start_date: string;
    end_date: string;
    status: EnrollmentStatus;
  } | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<{
    student_id: number;
    course_id: number;
    classroom: string;
    start_date: string;
    end_date: string;
    status: EnrollmentStatus;
  }>({
    student_id: 0,
    course_id: 0,
    classroom: "Room A101",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "active",
  });

  const loadData = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const [enrollmentList, studentList, courseList] = await Promise.all([
        enrollmentApi.list(query.trim()),
        studentApi.list(),
        courseApi.list(),
      ]);
      setEnrollments(enrollmentList);
      setStudents(studentList);
      setCourses(courseList);

      if (studentList.length > 0 && courseList.length > 0) {
        setCreateForm((prev) => ({
          ...prev,
          student_id: prev.student_id || studentList[0].id,
          course_id: prev.course_id || courseList[0].id,
        }));
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load enrollments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [enrollmentList, studentList, courseList] = await Promise.all([
          enrollmentApi.list(),
          studentApi.list(),
          courseApi.list(),
        ]);
        if (!ignore) {
          setEnrollments(enrollmentList);
          setStudents(studentList);
          setCourses(courseList);
          if (studentList.length > 0 && courseList.length > 0) {
            setCreateForm((prev) => ({
              ...prev,
              student_id: prev.student_id || studentList[0].id,
              course_id: prev.course_id || courseList[0].id,
            }));
          }
        }
      } catch (cause) {
        if (!ignore) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load enrollments."
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadData(search);
  }

  function startEditing(item: Enrollment) {
    setError(null);
    setEditingId(item.id);
    setEditValues({
      classroom: item.classroom,
      start_date: item.start_date,
      end_date: item.end_date ?? "",
      status: item.status,
    });
  }

  async function saveEnrollment(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    if (!editValues) return;

    setSavingId(id);
    setError(null);
    try {
      const updated = await enrollmentApi.update(id, {
        classroom: editValues.classroom.trim(),
        start_date: editValues.start_date,
        end_date: editValues.end_date || null,
        status: editValues.status,
      });
      setEnrollments((current) =>
        current.map((item) => (item.id === id ? updated : item))
      );
      setEditingId(null);
      setEditValues(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update enrollment."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deleteEnrollment(item: Enrollment) {
    if (!window.confirm(`Delete enrollment #${item.id}? This cannot be undone.`))
      return;

    setDeletingId(item.id);
    setError(null);
    try {
      await enrollmentApi.delete(item.id);
      setEnrollments((current) => current.filter((x) => x.id !== item.id));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not delete enrollment."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreateEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createForm.student_id || !createForm.course_id) {
      setError("Please select both a student and a course.");
      return;
    }
    setCreateSubmitting(true);
    setError(null);
    try {
      const payload: EnrollmentCreate = {
        student_id: Number(createForm.student_id),
        course_id: Number(createForm.course_id),
        classroom: createForm.classroom.trim(),
        start_date: createForm.start_date,
        end_date: createForm.end_date ? createForm.end_date : null,
        status: createForm.status,
      };
      const newEnrollment = await enrollmentApi.create(payload);
      setEnrollments((prev) => [newEnrollment, ...prev]);
      setIsCreateOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create enrollment."
      );
    } finally {
      setCreateSubmitting(false);
    }
  }

  // Lookup helpers
  const studentMap = new Map(students.map((s) => [s.id, s.name]));
  const courseMap = new Map(courses.map((c) => [c.id, c.name]));

  const filteredEnrollments = enrollments.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const sName = studentMap.get(e.student_id)?.toLowerCase() || "";
      const cName = courseMap.get(e.course_id)?.toLowerCase() || "";
      const room = e.classroom.toLowerCase();
      return sName.includes(q) || cName.includes(q) || room.includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
            <Clock size={12} />
            Pending
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "dropped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
            <MinusCircle size={12} />
            Dropped
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <section className="space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enrollments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage student classroom course enrollments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadData(search)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Enroll Student
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex max-w-md flex-1 gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search enrollments</span>
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, course, or room..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center rounded-lg border border-gray-300 bg-white p-1 text-xs">
          {(["all", "active", "pending", "completed", "dropped"] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3 py-1.5 font-medium capitalize transition ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadData(search)}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">
            Enrollment Records ({filteredEnrollments.length})
          </h2>
        </div>
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            Loading enrollments...
          </p>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <GraduationCap size={28} className="mb-3 text-gray-400" />
            <p className="font-medium text-gray-800">No enrollments found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or enroll a new student.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-5 py-3">ID</th>
                  <th scope="col" className="px-5 py-3">Student</th>
                  <th scope="col" className="px-5 py-3">Course</th>
                  <th scope="col" className="px-5 py-3">Classroom</th>
                  <th scope="col" className="px-5 py-3">Dates</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEnrollments.map((item) => (
                  <tr key={item.id} className="text-gray-700 hover:bg-gray-50">
                    {editingId === item.id && editValues ? (
                      <>
                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                          #{item.id}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {studentMap.get(item.student_id) || `Student #${item.student_id}`}
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {courseMap.get(item.course_id) || `Course #${item.course_id}`}
                        </td>
                        <td className="px-3 py-3">
                          <input
                            aria-label="Classroom"
                            required
                            value={editValues.classroom}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                classroom: e.target.value,
                              })
                            }
                            className="w-28 rounded border border-gray-300 px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="px-3 py-3 space-y-1">
                          <input
                            type="date"
                            required
                            value={editValues.start_date}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                start_date: e.target.value,
                              })
                            }
                            className="w-32 rounded border border-gray-300 px-2 py-1 text-xs block"
                          />
                          <input
                            type="date"
                            value={editValues.end_date}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                end_date: e.target.value,
                              })
                            }
                            className="w-32 rounded border border-gray-300 px-2 py-1 text-xs block"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={editValues.status}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                status: e.target.value as EnrollmentStatus,
                              })
                            }
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <form
                            onSubmit={(e) => void saveEnrollment(e, item.id)}
                            className="flex items-center gap-2"
                          >
                            <button
                              type="submit"
                              disabled={savingId === item.id}
                              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {savingId === item.id ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditValues(null);
                              }}
                              disabled={savingId === item.id}
                              className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4 font-mono text-xs text-gray-500">
                          #{item.id}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {studentMap.get(item.student_id) || `Student #${item.student_id}`}
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {courseMap.get(item.course_id) || `Course #${item.course_id}`}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-gray-600">
                          {item.classroom}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600">
                          <div>From: {item.start_date}</div>
                          {item.end_date && <div>To: {item.end_date}</div>}
                        </td>
                        <td className="px-5 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(item)}
                              disabled={deletingId !== null || savingId !== null}
                              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteEnrollment(item)}
                              disabled={deletingId !== null || savingId !== null}
                              className="rounded-md bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {deletingId === item.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Enrollment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Enroll Student</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEnrollment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={createForm.student_id}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      student_id: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Select Course <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={createForm.course_id}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      course_id: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.status ? "" : "(Inactive)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Classroom <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Room A101"
                  value={createForm.classroom}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, classroom: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    value={createForm.start_date}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, start_date: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={createForm.end_date}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, end_date: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Initial Status
                </label>
                <select
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      status: e.target.value as EnrollmentStatus,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createSubmitting ? "Enrolling..." : "Enroll Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
