"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Search, RefreshCw, BookOpen, Plus, X, CheckCircle, XCircle } from "lucide-react";
import { courseApi, type Course, type CourseCreate } from "@/src/services/course";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    name: string;
    description: string;
    status: boolean;
  } | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<CourseCreate>({
    name: "",
    description: "",
    status: true,
  });

  const loadCourses = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await courseApi.list(query.trim());
      setCourses(result);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load courses."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const result = await courseApi.list();
        if (!ignore) setCourses(result);
      } catch (cause) {
        if (!ignore) {
          setError(
            cause instanceof Error ? cause.message : "Could not load courses."
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
    void loadCourses(search);
  }

  function startEditing(course: Course) {
    setError(null);
    setEditingId(course.id);
    setEditValues({
      name: course.name,
      description: course.description ?? "",
      status: course.status,
    });
  }

  async function saveCourse(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    if (!editValues) return;

    setSavingId(id);
    setError(null);
    try {
      const updated = await courseApi.update(id, {
        name: editValues.name.trim(),
        description: editValues.description.trim() || null,
        status: editValues.status,
      });
      setCourses((current) =>
        current.map((item) => (item.id === id ? updated : item))
      );
      setEditingId(null);
      setEditValues(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update course."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deleteCourse(course: Course) {
    if (!window.confirm(`Delete course "${course.name}"? This cannot be undone.`)) return;

    setDeletingId(course.id);
    setError(null);
    try {
      await courseApi.delete(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not delete course."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateSubmitting(true);
    setError(null);
    try {
      const newCourse = await courseApi.create({
        name: createForm.name.trim(),
        description: createForm.description?.trim() || null,
        status: createForm.status,
      });
      setCourses((prev) => [newCourse, ...prev]);
      setIsCreateOpen(false);
      setCreateForm({ name: "", description: "", status: true });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create course."
      );
    } finally {
      setCreateSubmitting(false);
    }
  }

  const filteredCourses = courses.filter((c) => {
    if (statusFilter === "active") return c.status === true;
    if (statusFilter === "inactive") return c.status === false;
    return true;
  });

  return (
    <section className="space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create, update, and manage educational courses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadCourses(search)}
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
            Add Course
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex max-w-md flex-1 gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search courses</span>
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
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

        <div className="flex items-center rounded-lg border border-gray-300 bg-white p-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              statusFilter === "active"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              statusFilter === "inactive"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Inactive
          </button>
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
            onClick={() => void loadCourses(search)}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Courses Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">
            Course Catalog ({filteredCourses.length})
          </h2>
        </div>
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            Loading courses...
          </p>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <BookOpen size={28} className="mb-3 text-gray-400" />
            <p className="font-medium text-gray-800">No courses found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or add a new course.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-5 py-3">ID</th>
                  <th scope="col" className="px-5 py-3">Course Name</th>
                  <th scope="col" className="px-5 py-3">Description</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="text-gray-700 hover:bg-gray-50">
                    {editingId === course.id && editValues ? (
                      <>
                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                          #{course.id}
                        </td>
                        <td className="px-3 py-3">
                          <input
                            aria-label="Course name"
                            required
                            value={editValues.name}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                name: e.target.value,
                              })
                            }
                            className="w-48 rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            aria-label="Course description"
                            value={editValues.description}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                description: e.target.value,
                              })
                            }
                            className="w-64 rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={editValues.status ? "active" : "inactive"}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                status: e.target.value === "active",
                              })
                            }
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <form
                            onSubmit={(e) => void saveCourse(e, course.id)}
                            className="flex items-center gap-2"
                          >
                            <button
                              type="submit"
                              disabled={savingId === course.id}
                              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {savingId === course.id ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditValues(null);
                              }}
                              disabled={savingId === course.id}
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
                          #{course.id}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {course.name}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {course.description || "—"}
                        </td>
                        <td className="px-5 py-4">
                          {course.status ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                              <CheckCircle size={12} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200">
                              <XCircle size={12} />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(course)}
                              disabled={deletingId !== null || savingId !== null}
                              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteCourse(course)}
                              disabled={deletingId !== null || savingId !== null}
                              className="rounded-md bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {deletingId === course.id ? "Deleting..." : "Delete"}
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

      {/* Add Course Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Course</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Next.js & React Mastery"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Course outline and syllabus details..."
                  value={createForm.description ?? ""}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.status ?? true}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, status: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Active & available for enrollment</span>
                </label>
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
                  {createSubmitting ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
